import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, normalizePath, moment } from 'obsidian';

const DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";

// todo: change regex to match the date format
const REGEX_DATE = /^\d{4}-\d{2}-\d{2}$/; 
const REGEX_DATE_RESCHEDULE = /\>(\d{4}-\d{2}-\d{2})/;
const REGEX_DATE_ORIGINAL = /\<(\d{4}-\d{2}-\d{2})/;
const REGEX_TASK = /^- \[(?![\>xX-])[^\]]\]/;
const REGEX_SUBTASK = /^[>\t]/;

export default class TaskNavPlugin extends Plugin {

	// returns filename of the daily note referenced by the call, and creates it if it does not exist
	async getReferencedDayNote(basename: string | undefined, offset = 0 ): Promise<string> {

		// todo: mvove configuration into settings loading 
		const dailyNotesSettings = this.app.internalPlugins.getPluginById("daily-notes")?.instance?.options;
		const folder = dailyNotesSettings?.folder || "";
		const format = dailyNotesSettings?.format || DEFAULT_DAILY_NOTE_FORMAT;
		const template = dailyNotesSettings?.template || "";

		let referenceDate = moment();	
		if (basename && REGEX_DATE.test(basename)) {
			referenceDate = moment(basename).add(offset,"days");
		} 
		const filename = normalizePath(folder+"/"+referenceDate.format(format)+".md");

		if (!this.app.vault.getAbstractFileByPath(filename)) {
			// if template file is set and exists, make a copy, otherwise create empty file
			const templateFile = this.app.vault.getAbstractFileByPath(template+".md");
			if (templateFile) {
				new Notice("Copying template for daily note at "+filename);
				await this.app.vault.copy(templateFile,filename);
			} else {
				new Notice("Creating empty daily note at "+filename);
				await this.app.vault.create(filename,"");
			}
		}
		return filename;
	}

	async onload() {
		
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'tasknav-reschedule-command',
			name: 'Reschedule tasks in the selection',
			hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "ArrowRight" }],			
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let line = editor.getCursor("from").line; 
				while(line <= editor.getCursor("to").line) {
					let block = [];
					let startLine = line;
					let lineString = editor.getLine(line)
					// skip if the line is not a task
					if (REGEX_TASK.test(lineString)) {
						do {
							block.push(lineString);
							line++;
							// add all the lines that are indented or quoted below the task
							lineString = editor.getLine(line)
						} while (REGEX_SUBTASK.test(lineString));
						
						const targetNote = REGEX_DATE_RESCHEDULE.test(block[0])
							? this.getReferencedDayNote(REGEX_DATE_RESCHEDULE.exec(block[0])[1],0)
							: this.getReferencedDayNote(view.file?.basename,+1);
						targetNote.then( filename => {
							let taskOriginal = block.shift();													
							// remove the rescheduling date from task 
							let mainTaskLine = taskOriginal.replace(REGEX_DATE_RESCHEDULE,'');
							// if there's no original date and current note is dayly note, add original date
							if (!REGEX_DATE.test(view.file?.basename)) {
								mainTaskLine = mainTaskLine + ' [[' + view.file?.basename + ']]'
							} else if( !REGEX_DATE_ORIGINAL.test(mainTaskLine)) {
								mainTaskLine = mainTaskLine + ' <' + view.file?.basename;
							} 
							this.app.vault.append(this.app.vault.getAbstractFileByPath(filename),"\n"+mainTaskLine)
							// add all remaining subtasks and quotes
							block.forEach(element => {
								this.app.vault.append(this.app.vault.getAbstractFileByPath(filename),"\n"+element)
							});
							// mark task as rescheduled
							editor.setLine(startLine,taskOriginal.replace(REGEX_TASK,'- [>]'));
						} )						
					} else {
						line++;
					}
				}
			}
		});

		this.addCommand({
			id: 'tasknav-navigate-back-command',
			name: 'Daily note of original task date',
			hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "ArrowLeft" }],			
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const lineString = editor.getLine(editor.getCursor().line); 
				const targetNote = REGEX_DATE_ORIGINAL.test(lineString)
					? this.getReferencedDayNote(REGEX_DATE_ORIGINAL.exec(lineString)[1],0)
					: this.getReferencedDayNote(view.file?.basename,-1);
				targetNote.then( filename => {
					const leaf = this.app.workspace.getLeaf(false);
					leaf.openFile(this.app.vault.getAbstractFileByPath(filename));
				} )						
			}
		});		

		this.addCommand({
			id: 'tasknav-next-command',
			name: 'Next day note (create if needed)',
			hotkeys: [{ modifiers: ["Ctrl"], key: "ArrowRight" }],			
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						this.getReferencedDayNote(markdownView.file?.basename,+1).then( filename => {
								const leaf = this.app.workspace.getLeaf(false);
								leaf.openFile(this.app.vault.getAbstractFileByPath(filename));
						} )
					}
					return true;
				}
			}
		});

		this.addCommand({
			id: 'tasknav-prev-command',
			name: 'Previous day note (create if needed)',
			hotkeys: [{ modifiers: ["Ctrl"], key: "ArrowLeft" }],			
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						this.getReferencedDayNote(markdownView.file?.basename,-1).then( filename => {
								const leaf = this.app.workspace.getLeaf(false);
								leaf.openFile(this.app.vault.getAbstractFileByPath(filename));
						} )
					}
					return true;
				}
			}
		});


	}

	onunload() {

	}

}
