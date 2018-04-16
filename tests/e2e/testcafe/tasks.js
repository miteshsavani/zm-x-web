import { profile } from './profile/profile';
import { actions, utilFunc } from './page-model/common';
import { tasks } from './page-model/tasks';
import { soap } from './utils/soap-client';

fixture `Tasks fixture`
	.page(profile.hostURL)
	.before( async ctx => {
		ctx.adminAuthToken = await soap.getAdminAuthToken();
	})
	.beforeEach( async t => {
		t.ctx.user = await soap.createAccount(t.fixtureCtx.adminAuthToken);
		t.ctx.userAuth = await soap.getUserAuthToken(t.ctx.user.email, t.ctx.user.password);
		await t.maximizeWindow();
	        console.log(await t.getBrowserConsoleMessages());
		await actions.loginEmailPage(t.ctx.user.email, t.ctx.user.password);
		await actions.clickNavBarMenuItem('Calendar');
	})
	.afterEach( async t  => {
		await soap.deleteAccount(t.ctx.user.id, t.fixtureCtx.adminAuthToken);
	});
    

test('L0 | Create new task list and add a new task using plus icon | C827434', async t => {
	const taskListName = 'Sample List';
	const taskName = 'Sample Task';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List', 'Header name should be Tasks - List');
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Create List...');
	await tasks.dialog.enterNewListText(taskListName);
	await tasks.dialog.clickModalDialogFooterButton('Create List');
	await tasks.panel.clickTaskListPlusIcon(taskListName);
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.enterDate(await utilFunc.getDatemmddyy(0));
	await tasks.dialog.clickModalDialogFooterButton('Save');  // To replace
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
});

test('L0 | Add a new task using plus icon in default task list | C827418 | Smoke', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.panel.clickTaskListPlusIcon(taskListName);
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.clickModalDialogFooterButton('Save');  // To replace
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
});

test('L1 | Add Task - Plus Button(+) - Task List View  | C870200', async t => {
	const taskListName = t.ctx.user.email;
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.panel.clickTaskListPlusIcon(taskListName);
	await t.expect(await tasks.dialog.isDialogPresent('Add Task')).ok('Verify that Add Task dailog is present');
});


test('L0 | Add new Task using Hover on task listname | C827415 | Smoke', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List1111');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.panel.hoveroverTaskList(taskListName);
	await t.expect(await tasks.panel.isCheckboxDisable(taskListName)).ok();
	await tasks.panel.enterAddTaskText(taskListName, taskName);
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
	await t.expect(await tasks.panel.isCheckboxEnable(taskListName,taskName)).ok();
});

test('L1 | Add new task using setting option | C827416', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('New Task');
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
	await t.expect(await tasks.panel.isCheckboxEnable(taskListName,taskName)).ok();
});

test('L1 | Select the Task view as priority and Add new Urgent task | C870199', async t => {
	const priorityName = 'URGENT !!';
	const taskName = 'Sample Task';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Priority View');
	await tasks.panel.clickPriorityListPlusIcon(priorityName);
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await t.expect(await tasks.panel.checkTaskExists(priorityName,taskName,'Priorityview')).ok();
});

test('L1 | Select the Task view as Due Date and Add new Due today task | C870202', async t => {
	const dueName = 'DUE TODAY';
	const taskName = 'Sample Task';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Due Date View');
	await tasks.panel.clickDueListPlusIcon(dueName);
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await t.expect(await tasks.panel.checkTaskExists(dueName,taskName,'DueDateview')).ok();
});


test('L1 | Create a Task with Priority value | C827433 | Bug: PREAPPS-343', async t => {
	const taskName = 'Sample Task';
	const taskNotes = 'Sample Notes';
	const taskListName = 'Test Tasklist';
	await soap.createTaskList(t.ctx.userAuth,taskListName);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('New Task');
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.selectTaskList(taskListName);
	await tasks.dialog.selectPriority('Urgent !!');
	await tasks.dialog.enterNotesText(taskNotes);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
	await tasks.panel.singleClickonTask(taskListName,taskName);
	await t.expect(await tasks.popup.isTaskPresentInPopup(taskName)).ok('Verify the task name in popup');
	await t.expect(await tasks.popup.isNotesPresentInPopup(taskNotes)).ok('Verify the task notes in popup');
	await t.expect(await tasks.panel.taskExclamationMark(taskListName, taskName)).contains('!!','Verify the task priority');
	
});

test('L1 | Create a Task with Due Date value | C827432 | Bug: PREAPPS-343', async t => {
	const dueDate = await utilFunc.getDatemmddyy(1);
	const taskName = 'Sample Task';
	const taskNotes = 'Sample Notes';
	const taskListName = 'Test Tasklist';
	await soap.createTaskList(t.ctx.userAuth,taskListName);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('New Task');
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.enterDate(dueDate);
	await tasks.dialog.selectTaskList(taskListName);
	await tasks.dialog.enterNotesText(taskNotes);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
	await tasks.panel.singleClickonTask(taskListName,taskName);
	await t.expect(await tasks.popup.isTaskPresentInPopup(taskName)).ok('Verify the task name in popup');
	await t.expect(await tasks.popup.isNotesPresentInPopup(taskNotes)).ok('Verify the task notes in popup');
	await t.expect(await tasks.panel.taskDueDateVal(taskListName,taskName)).eql(await utilFunc.calculateDueDate(dueDate), 'Verify the due date of task');
});

test('L2 | Add duplicate task in the same tasklist | C871013', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('New Task');
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('New Task');
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();

});


test('L2 | Hover on task listname and create task with giving whitespaces name | C827436', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = '   ';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.panel.hoveroverTaskList(taskListName);
	await t.expect(await tasks.panel.isCheckboxDisable(taskListName)).ok();
	await tasks.panel.enterAddTaskText(taskListName, taskName);
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).notOk('Verify that taskname is not present');
});


test('L2 | Add a new task without entering name value | C870192', async t => {
	const taskListName = t.ctx.user.email;
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.panel.clickTaskListPlusIcon(taskListName);
	await tasks.dialog.enterNotesText('sample');
	await t.expect(await tasks.dialog.isModalDialogFooterButtonDisable('Save')).ok('Verify the Save button is disable');
});

test('L2 | Add a new task with whitespace name value | C870193', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = '   ';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.panel.clickTaskListPlusIcon(taskListName);
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.enterNotesText('sample');
	await t.expect(await tasks.dialog.isModalDialogFooterButtonDisable('Save')).ok('Verify the Save button is disable');
});

test('L0 | Right click on task and verify the Edit dialog | C876362', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth,parentFolderID, taskName, t.ctx.user.email);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
	await tasks.panel.rightClickonTaskAndSelectOption(taskListName,taskName,'Edit Task');
	await tasks.dialog.clickModalDialogFooterButton('Cancel');
	await tasks.panel.singleClickonTask(taskListName,taskName);
	await t.expect(await tasks.popup.isTaskPresentInPopup(taskName)).ok('Verification of Task Name');
});

test('L1 | Edit the task details | C870191 | PREAPPS-343', async t => {
	const taskListName = t.ctx.user.email;
	const oldtaskName = 'Old Task';
	const newtaskName = 'New Task';
	const oldNotes = 'Old Notes';
	const newNotes = 'New Notes';
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth,parentFolderID, oldtaskName, t.ctx.user.email,await utilFunc.getDateyyyymmdd(0),oldNotes);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,oldtaskName)).ok('Verify that task is present');
	await tasks.panel.rightClickonTaskAndSelectOption(taskListName,oldtaskName,'Edit Task');
	await tasks.dialog.enterNewTaskText(newtaskName);
	await tasks.dialog.enterNotesText(newNotes);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,newtaskName)).ok('Verify that tasklist is present');
	await tasks.panel.singleClickonTask(taskListName, newtaskName);
	await t.expect(await tasks.popup.isTaskPresentInPopup(newtaskName)).ok('Verification of Task Name');
	await t.expect(await tasks.popup.isNotesPresentInPopup(newNotes)).ok('Verification of Notes details');
});

test('L1 | Mark Done task | C870195', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.panel.hoveroverTaskList(taskListName);
	await t.expect(await tasks.panel.isCheckboxDisable(taskListName)).ok();
	await tasks.panel.enterAddTaskText(taskListName, taskName);
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
	await tasks.panel.markTaskAsDone(taskListName, taskName);
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Done View');
	await t.expect(await tasks.panel.checkTaskExists(taskListName, taskName,'Doneview')).ok('Verification the present of task in Done view');
});

test('L0 | Verify  Done view | C827422', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth,parentFolderID, taskName, t.ctx.user.email,await utilFunc.getDateyyyymmdd(0));
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Done View');
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - Done');
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('List View');
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName)).ok();
	await tasks.panel.hoveroverTaskList(taskListName);
	await tasks.panel.markTaskAsDone(taskListName, taskName);
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Done View');
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - Done');
	await t.expect(await tasks.panel.checkTaskExists(taskListName, taskName,'Doneview')).ok('Verification the present of task in Done view');
});

test('L2 | Edit the done task | C870196 | Bug: PREAPPS-343', async t => {
	const taskListName = t.ctx.user.email;
	const oldtaskName = 'Old Task';
	const newtaskName = 'New Name';
	const oldNotes = 'Old Notes';
	const newNotes = 'New Notes';
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth,parentFolderID, oldtaskName, t.ctx.user.email,await utilFunc.getDateyyyymmdd(0),oldNotes);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,oldtaskName)).ok();
	await tasks.panel.markTaskAsDone(taskListName,oldtaskName);
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Done View');
	await t.expect(await tasks.panel.checkTaskExists(taskListName, oldtaskName, 'Doneview')).ok('Verification the present of task in Done view');
	await tasks.panel.rightClickonTaskAndSelectOption(taskListName,oldtaskName,'Edit Task','Doneview');
	await tasks.dialog.enterNewTaskText(newtaskName);
	await tasks.dialog.enterNotesText(newNotes);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - Done');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,newtaskName,'Doneview')).ok('Verify that task is present in Done view');
	await tasks.panel.singleClickonTask(taskListName, newtaskName ,'Doneview');
	await t.expect(await tasks.popup.isTaskPresentInPopup(newtaskName)).ok('Verification of Task Name');
	await t.expect(await tasks.popup.isNotesPresentInPopup(newNotes)).ok('Verification of Notes details');


});

test('L1 | Uncheck the done task | C870197', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Done Task';
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth,parentFolderID, taskName, t.ctx.user.email);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
	await tasks.panel.markTaskAsDone(taskListName,taskName);
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Done View');
	await t.expect(await tasks.panel.checkTaskExists(taskListName, taskName, 'Doneview')).ok('Verification the present of task in Done view');
	await tasks.panel.unMarkDoneTask(taskName);
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName,'Doneview')).notOk('Verify task no longer shows in the Done view');
});

test('L2 | Delete tasks from Priority view | C871062 | Bug: PREAPPS-342', async t => {
	const priorityName = ['URGENT !!', 'IMPORTANT !', 'NORMAL'];
	const taskName = ['Task1', 'Task2', 'Task3'];
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName[0], t.ctx.user.email,await utilFunc.getDateyyyymmdd(0),'TestNotes',priorityName[0]);
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName[1], t.ctx.user.email,await utilFunc.getDateyyyymmdd(0),'TestNotes',priorityName[1]);
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName[2], t.ctx.user.email,await utilFunc.getDateyyyymmdd(0),'TestNotes',priorityName[2]);
	await t.eval(() => location.reload(true));
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Priority View');
	await tasks.panel.rightClickonTaskAndSelectOption(priorityName[0],taskName[0],'Delete Task','Priorityview');
	await t.expect(await tasks.panel.checkTaskExists(priorityName[0],taskName[0],'Priorityview')).notOk();
	await tasks.panel.rightClickonTaskAndSelectOption(priorityName[1],taskName[1],'Delete Task','Priorityview');
	await t.expect(await tasks.panel.checkTaskExists(priorityName[1],taskName[1],'Priorityview')).notOk();
	await tasks.panel.rightClickonTaskAndSelectOption(priorityName[2],taskName[2],'Delete Task','Priorityview');
	await t.expect(await tasks.panel.checkTaskExists(priorityName[2],taskName[2],'Priorityview')).notOk();
});

test('L2 | Delete tasks from Due Date view | C871063 | Bug: PREAPPS-342', async t => {
	const dueDate = ['PAST DUE', 'DUE TODAY', 'UPCOMING'];
	const taskName = ['Task1', 'Task2', 'Task3'];
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName[0], t.ctx.user.email,await utilFunc.getDateyyyymmdd(-1));
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName[1], t.ctx.user.email,await utilFunc.getDateyyyymmdd(0));
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName[2], t.ctx.user.email,await utilFunc.getDateyyyymmdd(1));
	await t.eval(() => location.reload(true));
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Due Date View');
	await tasks.panel.rightClickonTaskAndSelectOption(dueDate[0],taskName[0],'Delete Task','DueDateview');
	await t.expect(await tasks.panel.checkTaskExists(dueDate[0],taskName[0],'DueDateview')).notOk();
	await tasks.panel.rightClickonTaskAndSelectOption(dueDate[1],taskName[1],'Delete Task','DueDateview');
	await t.expect(await tasks.panel.checkTaskExists(dueDate[1],taskName[1],'DueDateview')).notOk();
	await tasks.panel.rightClickonTaskAndSelectOption(dueDate[2],taskName[2],'Delete Task','DueDateview');
	await t.expect(await tasks.panel.checkTaskExists(dueDate[2],taskName[2],'DueDateview')).notOk();
});

test('L2 | Delete tasks from Done view | C871064 | Bug: PREAPPS-342', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Done Task';
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName, t.ctx.user.email,await utilFunc.getDateyyyymmdd(0));
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).ok();
	await tasks.panel.markTaskAsDone(taskListName, taskName);
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Done View');
	await tasks.panel.rightClickonTaskAndSelectOption(taskListName,taskName,'Delete Task','Doneview');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName,'Doneview')).notOk();
});

test('L0 | Verify List view | C827419', async t => {
	const taskListName = t.ctx.user.email;
	const priorityName = ['URGENT !!', 'IMPORTANT !', 'NORMAL'];
	const taskName = ['Task1', 'Task2', 'Task3'];
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName[0], t.ctx.user.email, await utilFunc.getDateyyyymmdd(-1), 'TestNotes', priorityName[0]);
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName[1], t.ctx.user.email, await utilFunc.getDateyyyymmdd(0), 'TestNotes', priorityName[1]);
	await soap.createTask(t.ctx.userAuth, parentFolderID, taskName[2], t.ctx.user.email, await utilFunc.getDateyyyymmdd(1), 'TestNotes', priorityName[2]);
	await t.eval(() => location.reload(true));
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('List View');
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName[0])).ok();
	await t.expect(await tasks.panel.taskExclamationMark(taskListName, taskName[0])).contains('!!','Verify the Urgent task exclamation mark');
	await t.expect(await tasks.panel.taskExclamationMark(taskListName, taskName[1])).contains('!','Verify the Important task exclamation mark');
	await t.expect(await tasks.panel.taskExclamationMark(taskListName, taskName[2])).notContains('!','Verify the Normal task exclamation mark');
	await t.expect(await tasks.panel.taskDueDateVal(taskListName, taskName[0])).contains(await utilFunc.calculateDueDate(await utilFunc.getDateyyyymmdd(-1)),'Verify the Due Date value');
});


test('L2 | Add a new task list with whitespace name value | C827437', async t => {
	const taskListName = '   ';
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Create List...');
	await tasks.dialog.enterNewListText(taskListName);
	await t.expect(await tasks.dialog.isModalDialogFooterButtonDisable('Create List')).ok('Verify the Create List button is disable');
});

test('L1 | Rename Task list on double click on it | C870203', async t => {
	const oldTaskListName = 'Old Tasklist';
	const newTaskListName = 'New Tasklist';
	await soap.createTaskList(t.ctx.userAuth,oldTaskListName);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await tasks.panel.doubleClickonTaskList(oldTaskListName.toUpperCase());
	await tasks.panel.editTaskListText(newTaskListName);
	await t.expect(await tasks.panel.checkTaskListExists(newTaskListName.toUpperCase())).ok('Verify the Tasklist name');
});

test('L1 | Rename task list using context menu | C870204', async t => {
	const oldTaskListName = 'Old Tasklist';
	const newTaskListName = 'New Tasklist';
	await soap.createTaskList(t.ctx.userAuth,oldTaskListName);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await tasks.panel.rightClickonTaskListAndSelectOption(oldTaskListName.toUpperCase(),'Rename Task List');
	await tasks.panel.editTaskListText(newTaskListName);
	await t.expect(await tasks.panel.checkTaskListExists(newTaskListName.toUpperCase())).ok('Verify the Tasklist name');
});

test('L1 | Add Duplicate Task list name | C827439', async t => {
	const taskListName = 'First Tasklist';
	await soap.createTaskList(t.ctx.userAuth,taskListName);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	
	await tasks.header.clickTasksSettingsIcon();
	await tasks.header.selectMenuItem('Create List...');
	await tasks.dialog.enterNewListText(taskListName);
	await tasks.dialog.clickModalDialogFooterButton('Create List');
	await t.expect(await tasks.dialog.getErrorMessage()).contains('A task list with this name already exists. Please enter a different name for your task list.','Verify the expected error message');
});

test('L1 | Task Delete operation | C871061 | Bug: PREAPPS-342', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	const Notes = 'Sample Notes';
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth,parentFolderID, taskName, t.ctx.user.email,await utilFunc.getDateyyyymmdd(0),Notes);
	await t.eval(() => location.reload(true));
	await tasks.panel.rightClickonTaskAndSelectOption(taskListName, taskName,'Delete Task');
	await t.expect(await actions.getToastMessage()).contains('Task deleted.','Verification of Toast Message');
});

test('L2 | Task List Context Menu - Delete Task List | C875258', async t => {
	const taskListName = 'New Task List';
	await soap.createTaskList(t.ctx.userAuth,taskListName);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName.toUpperCase())).ok('Verify the Tasklist name');
	await tasks.panel.rightClickonTaskListAndSelectOption(taskListName,'Delete Task List');
	await t.expect(await actions.getToastMessage()).contains('Task List Deleted.','Verification of Toast Message');
});

test('L2 | Undo operation after task Delete operation | C871060 | Bug: PREAPPS-342', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	const Notes = 'Sample Notes';
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth,parentFolderID, taskName, t.ctx.user.email,await utilFunc.getDateyyyymmdd(0),Notes);
	await t.eval(() => location.reload(true));
	await tasks.panel.rightClickonTaskAndSelectOption(taskListName, taskName,'Delete Task');
	await t.expect(await actions.getToastMessage()).contains('Task deleted.','Verification of Toast Message');
	await actions.clickOnUndo();
	await t.expect(await tasks.panel.checkTaskExists(taskListName, taskName));
});

test('L3 | Task List Context Menu - Delete Task List - Undo | C875259 | Bug: PREAPPS-513', async t => {
	
	const taskListName = 'New Task List';
	await soap.createTaskList(t.ctx.userAuth,taskListName);
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName.toUpperCase())).ok('Verify the Tasklist name');
	await tasks.panel.rightClickonTaskListAndSelectOption(taskListName,'Delete Task List');
	await t.expect(await actions.getToastMessage()).contains('Task List Deleted.','Verification of Toast Message');
	await actions.clickOnUndo();
	await t.expect(await actions.getToastMessage()).contains('Task List Restored.','Verification of Toast Message');
	await t.eval(() => location.reload(true));
	await t.expect(await tasks.tasksHeaderSelector.innerText).contains('Tasks - List');
	await t.expect(await tasks.panel.checkTaskListExists(taskListName.toUpperCase())).ok('Verify the Tasklist restored or not');
});

test('L2 | Add Task from task list contect menu | C875251 | Bug: PREAPPS-343', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	const Notes = 'Sample Notes';
	
	await tasks.panel.rightClickonTaskListAndSelectOption(taskListName,'New Task');
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.enterNotesText(Notes);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await tasks.panel.singleClickonTask(taskListName,taskName);
	await t.expect(await tasks.popup.isTaskPresentInPopup(taskName)).ok('Verification of Task Name');
	await t.expect(await tasks.popup.isNotesPresentInPopup(Notes)).ok('Verification of Notes details');
});

test('L2 | Add Task from task list contect menu and click Cancel | C875252', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	
	await tasks.panel.rightClickonTaskListAndSelectOption(taskListName,'New Task');
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.clickModalDialogFooterButton('Cancel');
	await t.expect(await tasks.panel.checkTaskExists(taskListName,taskName)).notOk('Verify that task is not added');
});

test('L3 | View task details for task without notes | C876498', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	await tasks.panel.rightClickonTaskListAndSelectOption(taskListName,'New Task');
	await tasks.dialog.enterNewTaskText(taskName);
	await tasks.dialog.clickModalDialogFooterButton('Save');
	await tasks.panel.singleClickonTask(taskListName,taskName);
	await t.expect(await tasks.popup.isTaskPresentInPopup(taskName)).ok('Verification of Task Name');
	await t.expect(await tasks.popup.isHorizontalDividerInPopup()).notOk('Verification of Horizontal divider');
});

test('L2 | Verify scroll bar for task with long notes | C876499', async t => {
	const taskListName = t.ctx.user.email;
	const taskName = 'Sample Task';
	const Notes = 'Test \n First line \n Second line \n Third line \n Forth line \n Fifth line';
	const parentFolderID = await soap.getTaskFolder(t.ctx.userAuth);
	await soap.createTask(t.ctx.userAuth,parentFolderID, taskName, t.ctx.user.email,await utilFunc.getDateyyyymmdd(0),Notes);
	await tasks.panel.singleClickonTask(taskListName,taskName);
	await t.expect(await tasks.popup.isTaskPresentInPopup(taskName)).ok('Verification of Task Name');
	await t.expect(await tasks.popup.isScrollbarforNotesInPopup).ok('Verify the scroll bar appear for the Notes textarea');
});
