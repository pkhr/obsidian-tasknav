# Tasks Navigation Plugin

## Overview

The Task Navigation plugin provides a simple and efficient workflow for rescheduling tasks and navigating across daily notes in Obsidian. With this plugin, you can easily move tasks between daily notes, reschedule them to specific dates, and maintain backlinks for better task tracking.

## Features

- Keep your task list as a simple list in daily note
- Use ">2024-08-19" format for marklets in tasks during the review
- Reschedule tasks one-by-one or in bulk by a command
- Move tasks to the next day's note with a single hotkey
- Automatically create new daily notes when rescheduling
- Maintain backlinks when moving tasks between notes

## Installation

1. Open Obsidian Settings
2. Navigate to Community Plugins and disable Safe Mode
3. Click on Browse and search for "Task Navigation"
4. Install the plugin and enable it
5. Review hotkeys 

## Usage

### Rescheduling Tasks

To reschedule a task to a specific date, add a marklet at the end of the task in the following format:

```
- [ ] Complete project proposal >2024-09-01
```

Press the hotkey (default: `Ctrl/Cmd + Shift + rigth arrow`) to move the task to the specified date's daily note.

### Moving Tasks to the Next Day

For tasks without a specific date marklet, pressing the hotkey will move the task to the next day's daily note.

### Examples

1. Reschedule to a specific date:
   ```
   - [ ] Call John about the meeting >2024-08-20
   ```
   Pressing the hotkey will move this task to the August 20, 2024 daily note.

2. Move to the next day:
   ```
   - [ ] Review quarterly report
   ```
   Pressing the hotkey on August 17, 2024 will move this task to the August 18, 2024 daily note.

3. Task in a project note:
   ```
   - [ ] Update project timeline
   ```
   Pressing the hotkey will move this task to today's daily note and add a backlink to the original project note.

## Configuration

This version of the plugin assumes YYYY-MM-DD format for the daily notes. 

- Change the default hotkeys
- Set the location for new daily notes in standard Obsidian settings

## Troubleshooting

If you encounter any issues:

1. Ensure the plugin is up to date
2. Check that your daily notes are in the expected format and location
3. Verify that the date marklets are correctly formatted

For further assistance, please open an issue on the plugin's GitHub repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This plugin is licensed under the MIT License.
