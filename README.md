# virtual-office-scheduler
Scheduler for https://github.com/TNG/virtual-office

## Session scheduler
* Parse Google Drive Spreadsheet
* Convert data structure to export JSON
  * Generate random join groups
  * Split up rooms with multiple meeting ids
  * Generate room join links
  * Add a given date to the start time of the rooms
* Export to Virtual Office

Start via
```
npm run start:scheduleSessions
```

## Meeting scheduler
Meeting scheduler for https://github.com/TNG/virtual-office

* Use a list of users to schedule zoom meetings

Start via
```
npm run start:start:createMeetings
```