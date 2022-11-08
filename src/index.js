import './style.css'
import { format, parseISO, formatDistanceToNow, formatRelative, subDays, compareAsc, isToday, isYesterday, isTomorrow, isBefore, isAfter, addDays } from 'date-fns'
import moment from 'moment'
import logo from './icons/check-square.svg'
import menu from './icons/menu.svg'
import down from './icons/chevron-down.svg'
import deleteIconLightMode from './icons/delete-lightmode.svg'
import deleteIconDarkMode from './icons/delete-darkmode.svg'
import editIconLightMode from './icons/edit-lightmode.svg'
import editIconDarkMode from './icons/edit-darkmode.svg'

// home button

// today button

// upcoming button

// projects -> list of all projects

//  add project

// following for MVC https://www.taniarascia.com/javascript-mvc-todo-app/

// the model works with data
class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || []
    this.projects = JSON.parse(localStorage.getItem('projects')) || [{id: 1, name: 'default project'}]
    // this.currentProject = JSON.parse(localStorage.getItem('currentProject')) || [{id: 1, current: this.projects[0]}]
    this.currentProject = JSON.parse(localStorage.getItem('currentProject')) || this.projects[0].name
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback
  }

  bindProjectListChanged(callback) {
    this.onProjectListChanged = callback
  }

  bindCurrentProjectChanged(callback) {
    this.onCurrentProjectChanged = callback
  }

  _commit(todos) {
    this.onTodoListChanged(todos)
    localStorage.setItem('todos', JSON.stringify(todos))
  }

  _commitProjectName(projects) {
    this.onProjectListChanged(projects)
    localStorage.setItem('projects', JSON.stringify(projects))
  }

  _commitCurrentProject(currentProject) {
    this.onCurrentProjectChanged(currentProject)
    localStorage.setItem('currentProject', JSON.stringify(currentProject))
  }

  updateCurrentProject(newCurrentProject) {
    this.currentProject = newCurrentProject
    this._commitCurrentProject(this.currentProject)
    this._commit(this.todos)

    console.log('[model]new current project updated')
  }

  addTodo(taskTitle, taskDesc, taskDate, priorityValue, optionalNotes, taskProject) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      title: taskTitle,
      description: taskDesc,
      date: taskDate,
      priority: priorityValue,
      notes: optionalNotes,
      project: taskProject,
      complete: false,
    }
    this.todos.push(todo)
    this._commit(this.todos)

    console.log("[model]todo added to list")
  }

  addProjectName(projectName) {
    const project = {
      id: this.projects.length > 0 ? this.projects[this.projects.length - 1].id + 1 : 1,
      name: projectName
    }
    this.projects.push(project)
    this._commitProjectName(this.projects)

    console.log('[model]project name added to projects')
  }

  editTodo(id) {
    console.log(`[model][editTodo] id: ${id}`)
  }

  editTodoTitle(id, updatedTitle) {
    console.log('[model]')
    this.todos = this.todos.map((todo) => 
    todo.id === id ? {
      id: todo.id, 
      title: updatedTitle,
      description: todo.description, 
      date: todo.date,
      priority: todo.priority,
      notes: todo.notes,
      project: todo.project,
      complete: todo.complete } : todo
    )

    this._commit(this.todos)
  }

  editTodoDescription(id, updatedDesc) {
    this.todos = this.todos.map((todo) => 
    todo.id === id ? {
      id: todo.id, 
      title: todo.title, 
      description: updatedDesc, 
      date: todo.date,
      priority: todo.priority,
      notes: todo.notes,
      project: todo.project,
      complete: todo.complete } : todo
    )

    this._commit(this.todos)
  }

  editTodoDate(id, updatedDate) {
    this.todos = this.todos.map((todo) => 
    todo.id === id ? {
      id: todo.id, 
      title: todo.title, 
      description: todo.description, 
      date: updatedDate,
      priority: todo.priority,
      notes: todo.notes,
      project: todo.project,
      complete: todo.complete } : todo
    )

    this._commit(this.todos)
  }

  editTodoPriority(id, updatedPriority) {
    this.todos = this.todos.map((todo) => 
    todo.id === id ? {
      id: todo.id, 
      title: todo.title, 
      description: todo.description, 
      date: todo.date,
      priority: updatedPriority,
      notes: todo.notes,
      project: todo.project,
      complete: todo.complete } : todo
    )

    this._commit(this.todos)
  }

  editTodoNotes(id, updatedNotes) {
    this.todos = this.todos.map((todo) => 
    todo.id === id ? {
      id: todo.id, 
      title: todo.title, 
      description: todo.description, 
      date: todo.date,
      priority: todo.priority,
      notes: updatedNotes,
      project: todo.project,
      complete: todo.complete } : todo
    )

    this._commit(this.todos)
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id)

    this._commit(this.todos)
  }

  toggleTodo(id) {
    this.todos = this.todos.map((todo) =>
    todo.id === id ? {
      id: todo.id, 
      title: todo.title, 
      description: todo.description, 
      date: todo.date,
      priority: todo.priority,
      notes: todo.notes,
      project: todo.project,
      complete: !todo.complete } : todo
    )

    this._commit(this.todos)
  }
}

// used for UI logic--such as customer view including UI components such as text boxes, dropdowns
class View {
  constructor() {
    this.x = 0;
    this.body = this.getElem('body')
    this.body.classList.add('dark:bg-slate-900')
    this.app = this.getElem('#content')
    this.app.classList = 'flex flex-col items-center h-screen'

    this.newTaskBtn = this.getElem('#newTask')

    this.overlay = this.createElem('div')
    this.overlay.id = 'overlay'
    this.overlay.classList = 'fixed w-screen h-screen transition-opacity duration-500 ease-in-out bg-gray-900 opacity-0 invisible'
    this.app.append(this.overlay)

    this.overlayCard = this.createElem('div')
    this.overlayCard.id = 'overlayCard'
    this.overlayCard.classList = 'mt-24 overflow-y-auto h-4/5 fixed flex flex-col transition-opacity duration-500 ease-in-out opacity-0 invisible bg-white shadow-lg rounded-2xl w-3/4 p-6 dark:bg-gray-700'
    this.app.append(this.overlayCard)

    this.title = this.createElem('h1', 'text-2xl text-center mb-6 dark:text-white')
    this.title.textContent = 'Add a new task'

    this.form = this.createElem('form')
    this.form.classList = 'grid'

    this.submitBtn = this.createElem('button', 'mt-4 w-fit justify-self-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800')
    this.submitBtn.textContent = 'Submit'

    this.todoList = this.createElem('ul', 'todo-list grid grid-cols-1 lg:grid-cols-3 gap-4 mb-28')
    this.todoListWrapper = this.createElem('div', 'mt-20 w-10/12')
    this.todoListWrapper.id = 'todo-list-wrapper'
    this.todoListWrapper.append(this.todoList)

    // task title
    this.taskTitle = this.createElem('input')
    this.taskTitle.type = 'text'
    this.taskTitle.classList = 'block p-4 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
    this.taskTitle.placeholder = 'e.g., Learn Portuguese'
    this.taskTitle.name = 'taskTitle'

    this.taskTitleLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.taskTitleLabel.textContent = 'Task title'
    this.taskTitleContainer = this.createElem('div', 'mb-2')
    this.taskTitleContainer.append(this.taskTitleLabel, this.taskTitle)

    // task description
    this.taskDesc = this.createElem('input')
    this.taskDesc.type = 'text'
    this.taskDesc.classList = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
    this.taskDesc.placeholder = 'e.g., Hour long session'
    this.taskDesc.name = 'taskDesc'

    this.taskDescLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.taskDescLabel.textContent = 'Description'
    this.taskDescContainer = this.createElem('div', 'mb-2')
    this.taskDescContainer.append(this.taskDescLabel, this.taskDesc)  

    // task date
    this.taskDate = this.createElem('input', 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
    this.taskDate.type = 'date'
    this.taskDate.value = moment().format('YYYY-MM-DD')
    this.taskDate.name = 'taskDate'

    this.taskDateLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.taskDateLabel.textContent = 'Date'
    this.taskDateContainer = this.createElem('div', 'mb-2')
    this.taskDateContainer.append(this.taskDateLabel, this.taskDate)  

    // task optional notes
    this.optionalNotes = this.createElem('input')
    this.optionalNotes.type = 'text'
    this.optionalNotes.classList = 'block p-2 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
    this.optionalNotes.placeholder = 'e.g., bring flashcards'
    this.optionalNotes.name = 'optionalNotes'

    this.optionalNotesLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.optionalNotesLabel.textContent = 'Optional notes'
    this.optionalNotesContainer = this.createElem('div', 'mb-2')
    this.optionalNotesContainer.append(this.optionalNotesLabel, this.optionalNotes)  

    // task priority level
    this.radioGroup = this.createElem('div', 'radio-group')

    this.radioGroupLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.radioGroupLabel.textContent = 'Priority level'
    this.radioGroupContainer = this.createElem('div', 'mb-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600')
    this.radioGroupContainer.append(this.radioGroupLabel, this.radioGroup)  

    // https://www.tutorialspoint.com/how-to-dynamically-create-radio-buttons-using-an-array-in-javascript
    const priority = ['Low', 'Normal', 'High']
    priority.forEach((priorityValue, index) => {

      this.selectionContainer = this.createElem('div')
      this.selectionContainer.classList = 'flex items-center mb-2'

      this.inputValue = this.createElem('input')
      this.inputValue.type = 'radio'
      this.inputValue.name = 'priority'
      this.inputValue.value = priorityValue
      this.inputValue.priorityValue = index
      this.inputValue.classList = 'w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300'

      this.labelValue = this.createElem('label')
      this.labelValue.innerHTML = priorityValue
      this.labelValue.classList = 'block ml-2 text-sm font-medium text-gray-900 dark:text-gray-100'

      this.selectionContainer.append(this.inputValue, this.labelValue)

      this.radioGroup.append(this.selectionContainer)
    })

    // project options
    this.projectOptions = this.createElem('select', 'bg-gray-50 border border-gray-300 text-gray-900 mb-2 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
    this.projectOptions.id = 'projects'
    this.projectOptions.name = 'projects'

    this.projectOptionsLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.projectOptionsLabel.textContent = 'Choose a project for the task'
    this.projectOptionsContainer = this.createElem('div', 'mb-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600')
    this.projectOptionsContainer.append(this.projectOptionsLabel, this.projectOptions)

    // const projects = ['Default project', 'Another project', 'Work project']

    this.projectsList = this.createElem('ul', 'projects-list')
    this.projectOptions.append(this.projectsList)

    // projects.forEach((project, index) => {

    //   this.projectOption = this.createElem('option')
    //   this.projectOption.value = project
    //   this.projectOption.textContent = project

    //   this.projectOptions.append(this.projectOption)
    // })

    // navbar 
    this.navbar = this.createElem('nav', 'fixed w-screen p-3 bg-gray-50 rounded border-gray-200 dark:bg-gray-800 dark:border-gray-700')
    this.navbarContainer = this.createElem('div', 'flex justify-between items-center')
    this.logoContainer = this.createElem('a', 'flex items-center')
    this.logoImg = this.createElem('img', 'mr-1 h-6 sm:h-10 dark:invert')
    this.logoImg.src = logo
    this.currentProjectTitle = this.createElem('span', 'self-center text-xl font-semibold whitespace-nowrap dark:text-white')
    // this.currentProjectTitle.textContent = 'Todo List'
    
    

    this.logoContainer.append(this.logoImg, this.currentProjectTitle)

    // this.menuBtn = this.createElem('button', 'inline-flex justify-center items-center text-gray-400 rounded-lg hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-gray-400 dark:hover:text-white dark:focus:ring-gray-500')
    this.menuBtn = this.createElem('button', 'inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900')
    this.menuWrapper = this.createElem('div', 'relative inline-block text-left')
    this.menuWrapper2 = this.createElem('div')

    
    this.menuText = this.createElem('span', 'p-1')
    this.menuText.textContent = 'Projects'
    this.menuLogo = this.createElem('img', 'p-.5 dark:invert')
    this.menuLogo.src = down
    
    this.menuBtnContents = this.createElem('div', 'flex')
    this.menuBtnContents.append(this.menuText, this.menuLogo)
    
    this.menuWrapper.append(this.menuWrapper2)
    this.menuWrapper2.append(this.menuBtn)
    this.menuBtn.append(this.menuBtnContents)

    // project menu dropdown
    this.menuDropdown = this.createElem('div', 'transition-opacity duration-150 ease-in-out opacity-0 hidden invisible absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 shadow dark:border-gray-100 dark:bg-gray-800 dark:divide-gray-600')
    this.menuDropdown.id = 'menu-dropdown'
    this.menuDropdownWrapper = this.createElem('div', 'py-1 overflow-y-auto')
    this.menuDropdownWrapper.id = 'project-buttons'

    this.menuDropdown.append(this.menuDropdownWrapper)
    this.menuWrapper.append(this.menuDropdown)

    // this.defaultProject = this.createElem('button', 'w-full text-gray-700 block px-4 py-2 text-sm')
    // this.defaultProject.textContent = 'Default project'

    // this.exampleProject = this.createElem('button', 'w-full text-gray-700 block px-4 py-2 text-sm')
    // this.exampleProject.textContent = 'Example project'

    // this.menuDropdownWrapper.append(this.defaultProject, this.exampleProject)

    // for new project 
    this.menuDropdownWrapper2 = this.createElem('div', 'py-1')
    this.newProjectBtn = this.createElem('button', 'w-full text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm font-bold')
    this.newProjectBtn.textContent = 'New project'
    this.menuDropdownWrapper2.append(this.newProjectBtn)

    this.menuDropdown.append(this.menuDropdownWrapper2)


    // project name form
    this.projectNameForm = this.createElem('form', 'hidden invisible opacity-0 transition-opacity duration-150 ease-in-out absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 p-4 dark:border-gray-100 dark:bg-gray-800 dark:divide-gray-600')

    this.projectName = this.createElem('input', 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
    this.projectName.type = 'text'
    this.projectName.placeholder = 'e.g., Computer Science'
    this.projectName.name = 'projectName'

    this.projectNameLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.projectNameLabel.textContent = 'Name your new project'
    this.projectNameContainer = this.createElem('div', 'mb-2')
    this.projectNameContainer.append(this.projectNameLabel, this.projectName)
    
    this.menuDropdown.append(this.projectNameForm)
    this.projectNameSubmitBtn = this.createElem('button', 'mt-2 w-fit justify-self-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800')
    this.projectNameSubmitBtn.textContent = 'Submit'

    this.projectNameForm.append(this.projectNameContainer, this.projectNameSubmitBtn)

    // dropdown overlay
    this.menuOverlay = this.createElem('div', 'fixed w-screen h-screen transition-opacity duration-500 ease-in-out bg-gray-900 opacity-0 hidden invisible')
    this.menuOverlay.id = 'menu-overlay'
    this.app.append(this.menuOverlay)

    // navbar current project
    // this.currentProjectTitle = this.createElem('h1', '')
    this.currentProjectTitle.id = 'current-project-title'

    this.navbarContainer.append(this.logoContainer, this.menuWrapper)
    this.navbar.append(this.navbarContainer)

    // append
    this.app.append(this.navbar)
    this.app.append(this.todoListWrapper)
    this.form.append(this.radioGroupContainer, this.projectOptionsContainer)
    this.form.append(this.taskTitleContainer, this.taskDescContainer, this.taskDateContainer, this.optionalNotesContainer, this.submitBtn)
    this.overlayCard.append(this.title, this.form)

    this._temporaryTitle = ''
    this._initLocalListeners()
    this.allProjects = ''
    this.allCurrentTodos = ''
    this._initEditTodoListeners()
  }

  get _priorityGroupChecked() {
    let checked
    const priorityValues = document.getElementsByName('priority')
    priorityValues.forEach((priority) => {
      if (priority.checked) {
        checked = true
      }
    })
    return checked
  }

  get _priorityValue() {
    let value
    const priorityValues = document.getElementsByName('priority')
    priorityValues.forEach((priority) => {
      if (priority.checked) {
        value = priority.value
      }
    })

    return value
  }

  get _taskTitle() {
    return this.taskTitle.value
  }

  get _taskDesc() {
    return this.taskDesc.value
  }

  get _taskDate() {
    return this.taskDate.value
  }

  get _optionalNotes() {
    return this.optionalNotes.value
  }

  get _taskProject() {
    return this.projectOptions.value
  }

  get _projectName() {
    return this.projectName.value
  }

  get _currentProject() {
    return this.currentProjectTitle.textContent
  }

  _resetPriorityGroup() {
    const priorityValues = document.getElementsByName('priority')
    priorityValues.forEach((priority) => {
      if (priority.checked) {
        priority.checked = false
      }
    })
  }
  _resetInput() {
    this.taskTitle.value = ''
    this.taskDesc.value = ''
    this.taskDate.value = moment().format('YYYY-MM-DD')
    this._resetPriorityGroup()
    this.projectOptions.selectedIndex = 0

    this.optionalNotes.value = ''
  }

  _resetProjectNameInput() {
    this.projectName.value = ''
  }

  _initLocalListeners() {
    this.todoList.addEventListener('input', event => {
      if (event.target.classList.contains('editable')) {
        this._temporaryTitle = event.target.innerText
        console.log(this._temporaryTitle)
      }
    })

    this.newTaskBtn.addEventListener('click', event => {
      this.overlay.classList.remove('hidden')
      this.overlayCard.classList.remove('hidden')
      this.menuWrapper.classList.remove('relative')
      setTimeout(() => {
        this.overlay.classList.remove('invisible', 'opacity-0')
        this.overlay.classList.add('opacity-90')
        this.overlayCard.classList.remove('invisible', 'opacity-0')
        this.overlayCard.classList.add('opacity-100')
      }, 10);
    })

    this.overlay.addEventListener('click', event => {
      this._closeFormOverlay()
    })

    this.menuBtn.addEventListener('click', event => {
      // if the projects dropdown isn't in the shown state, show it
      // else the project dropdown is active, close it
      if (this.menuDropdown.classList.contains('hidden')) {
        this.menuDropdown.classList.remove('hidden')
        this.menuOverlay.classList.remove('hidden')
        setTimeout(() => {
          this.menuDropdown.classList.remove('invisible', 'opacity-0')
          this.menuDropdown.classList.add('opacity-100')

          this.menuOverlay.classList.remove('invisible', 'opacity-0')
          this.menuOverlay.classList.add('opacity-90')
        }, 10);
      } else {
        this._closeMenuOverlay()
      }

    })

    this.menuOverlay.addEventListener('click', event => {
      this.menuDropdown.classList.remove('opacity-100')
      this.menuDropdown.classList.add('opacity-0')

      this.menuOverlay.classList.remove('opacity-90')
      this.menuOverlay.classList.add('opacity-0')

      this.projectNameForm.classList.remove('opacity-100')
      this.projectNameForm.classList.add('opacity-0')
      setTimeout(() => {
        this.menuDropdown.classList.add('invisible')
        this.menuDropdown.classList.add('hidden')

        this.menuOverlay.classList.add('invisible', 'hidden')

        this.projectNameForm.classList.add('invisible')
        this.projectNameForm.classList.add('hidden')
      }, 500);
    })

    this.newProjectBtn.addEventListener('click', event => {
      // initiate new project form
      if (this.projectNameForm.classList.contains('hidden')) {
        this.projectNameForm.classList.remove('hidden')
        setTimeout(() => {
          this.projectNameForm.classList.remove('invisible', 'opacity-0')
          this.projectNameForm.classList.add('opacity-100')
        }, 10);
      } else {
        this._closeProjectNameForm()
      }
    })    
  }

  _closeMenuOverlay() {
    this.menuDropdown.classList.remove('opacity-100')
    this.menuDropdown.classList.add('opacity-0')

    this.menuOverlay.classList.remove('opacity-90')
    this.menuOverlay.classList.add('opacity-0')

    this.projectNameForm.classList.remove('opacity-100')
    this.projectNameForm.classList.add('opacity-0')
    setTimeout(() => {
      this.menuDropdown.classList.add('invisible')
      this.menuDropdown.classList.add('hidden')

      this.menuOverlay.classList.add('invisible', 'hidden')

      this.projectNameForm.classList.add('invisible')
      this.projectNameForm.classList.add('hidden')
    }, 500);
  }

  _closeProjectNameForm() {
    this.projectNameForm.classList.remove('opacity-100')
    this.projectNameForm.classList.add('opacity-0')
    setTimeout(() => {
      this.projectNameForm.classList.add('invisible')
      this.projectNameForm.classList.add('hidden')
    }, 500);
  }

  _closeFormOverlay() {
    this.overlay.classList.remove('opacity-90')
    this.overlay.classList.add('opacity-0')
    this.overlayCard.classList.remove('opacity-100')
    this.overlayCard.classList.add('opacity-0')
    setTimeout(() => {
      this.overlay.classList.add('invisible')
      this.overlayCard.classList.add('invisible')
      this.overlay.classList.add('hidden')
      this.overlayCard.classList.add('hidden')
      this.menuWrapper.classList.add('relative')
    }, 500);
  }

  createElem(tag, className) {
    const element = document.createElement(tag)
    if (className) {
      element.classList = className
    }
    return element
  }

  getElem(selector) {
    const element = document.querySelector(selector)
    return element
  }

  displayTodos(todos) {
    // delete all nodes
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild)
    }

    let currentTodoList = []
    let highPriorityList = []
    let normalPriorityList = []
    let lowPriorityList = []
    
    if (todos.length > 0) {
      todos.forEach(todo => {
        // filter todos such that it's only the todos for the current project
        if (todo.project === this._currentProject) {
          currentTodoList.push(todo)
        } else {
        }
      })

      // filter the todos from the current project based off their priority
      currentTodoList.forEach(todo => {
        if (todo.priority === 'Low') {
          lowPriorityList.push(todo)
        } else if (todo.priority === 'Normal') {
          normalPriorityList.push(todo)
        } else if (todo.priority === 'High') {
          highPriorityList.push(todo)
        }
      })
    }

    // show default message
    if (currentTodoList.length === 0) {
      const p = this.createElem('p', 'text-center dark:text-white')
      p.textContent = 'Nothing to do! Add a task?'
      this.todoList.append(p)
    } else {
      this.allCurrentTodos = currentTodoList
      // create todo item nodes for each todo in state

      // normal sort

      // currentTodoList.forEach(todo => {
      //   const li = this.createElem('li')
      //   li.id = todo.id

      //   // each todo item will have a checkbox you can toggle
      //   const checkbox = this.createElem('input')
      //   checkbox.type = 'checkbox'
      //   checkbox.checked = todo.complete

      //   // todo item text will be in a contenteditable span
      //   const span = this.createElem('span', 'dark:text-white')
      //   span.contentEditable = true
      //   span.classList.add('editable-title')

      //   // if todo completed, add strikethrough
      //   if (todo.complete) {
      //     const strike = this.createElem('s')
      //     strike.textContent = todo.title
      //     span.append(strike)
      //   } else {
      //     span.textContent = todo.title
      //   }

      //   // todos have a delete button
      //   const deleteBtn = this.createElem('button', 'delete dark:text-white')
      //   deleteBtn.textContent = 'Delete'
      //   li.append(checkbox, span, deleteBtn)

      //   // append nodes to the todo list
      //   this.todoList.append(li)
      // })

      // sort based off priority
      this.x += 1
      console.log(`**** this.x: ${this.x}`)
      this._displayTodoList(highPriorityList)
      this._displayTodoList(normalPriorityList)
      this._displayTodoList(lowPriorityList)
    }
  }

  _displayTodoList(list) {
    const priorityWrapper = this.createElem('div', 'flex flex-col gap-4')
    
    list.forEach(todo => {
      // contents for title portion of card
      // const todoCard = this.createElem('div', 'p-4 w-full text-center bg-white rounded-lg border shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700')
      let todoCard = this.createElem('div')

      if (todo.priority === 'Low') {
        todoCard.classList = ('flex p-4 w-full bg-white rounded-lg border border-blue-400 shadow-md sm:p-4 dark:bg-gray-900 dark:border-blue-700')
      }
      if (todo.priority === 'Normal') {
        todoCard.classList = ('flex p-4 w-full bg-white rounded-lg border border-orange-400 shadow-md sm:p-4 dark:bg-gray-900 dark:border-orange-700')
      }
      if (todo.priority === 'High') {
        todoCard.classList = ('flex p-4 w-full bg-white rounded-lg border border-red-400 shadow-md sm:p-4 dark:bg-gray-900 dark:border-red-700')
      }

      const topContents = this.createElem('div', 'flex justify-between items-start')
      const rightContents = this.createElem('div', 'flex flex-col justify-between items-start w-full')
      rightContents.id = 'right-contents-wrapper'
      todoCard.classList.add('h-fit')
      todoCard.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-800', 'todo-card')
      todoCard.id = todo.id

      const checkboxWrapper = this.createElem('div', 'flex items-start')
      const checkbox = this.createElem('input', 'mt-1 mr-2 cursor-pointer')
      checkbox.type = 'checkbox'
      checkbox.checked = todo.complete



      const todoTitle = this.createElem('span', 'editable text-base dark:text-white')
      todoTitle.contentEditable = true



      if (todo.complete) {
        const strike = this.createElem('s')
        strike.textContent = todo.title
        todoTitle.append(strike)
      } else {
        todoTitle.textContent = todo.title
      }

      const todoDesc = this.createElem('h2', 'text-sm font-light text-gray-700 dark:text-gray-300')
      todoDesc.textContent = todo.description

      // contents for date portion of card
      const bottomContents = this.createElem('div', 'flex w-full justify-between items-center')
      const date = this.createElem('h2', 'text-sm')

      // format date
      const formattedDate = new Date(format(parseISO(todo.date), 'yyyy/MM/dd'))
      const now = new Date()
      // date.textContent = this.formatDate(formattedDate)
      date.textContent = this.formatDate(formattedDate, date)
      
      const deleteImg = this.createElem('img', 'delete h-6 cursor-pointer')
      const editImg = this.createElem('img', 'edit h-6 cursor-pointer')

      // todos have a delete button
      // const deleteBtn = this.createElem('button', 'delete flex p-3')
      // deleteBtn.textContent = ''
      // deleteBtn.append(deleteImg)


      // dark mode / light mode theme watching to change delete icon color
      let matched = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (matched) {
        deleteImg.src = deleteIconDarkMode
        editImg.src = editIconDarkMode
      } else {
        deleteImg.src = deleteIconLightMode
        editImg.src = editIconLightMode
      }

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // event.matches ? deleteImg.src = deleteIconDarkMode : deleteImg.src = deleteIconLightMode
        if (event.matches) {
          deleteImg.src = deleteIconDarkMode
          editImg.src = editIconDarkMode
        } else {
          deleteImg.src = deleteIconLightMode
          editImg.src = editIconLightMode
        }
      })

      const iconButtons = this.createElem('div', 'flex gap-2')
      iconButtons.append(editImg, deleteImg)
      bottomContents.append(date, iconButtons)

      // contents for description portion of card
      checkboxWrapper.append(checkbox)
      todoCard.append(checkboxWrapper, rightContents)
      // topContents.append(todoTitle, deleteImg)
      topContents.append(todoTitle)

      rightContents.append(topContents, todoDesc)
      if (todo.notes != '') {
        const todoNotes = this.createElem('h3', 'text-xs font-light text-gray-500')
        todoNotes.textContent = todo.notes
        rightContents.append(todoNotes)
      }
      rightContents.append(bottomContents)
      priorityWrapper.append(todoCard)
      this.todoList.append(priorityWrapper)


    })
  }

  formatDate(date, dateElement) {
    if (isToday(date)) {
      dateElement.classList.add('text-green-500')
      return `Today`
    }

    if (isYesterday(date)) {
      dateElement.classList.add('text-red-500')
      return `Yesterday`
    }

    if (isTomorrow(date)) {
      dateElement.classList.add('text-orange-500')
      return `Tomorrow`
    }

    if (isBefore(date, new Date())) {
      dateElement.classList.add('text-red-500')
      return formatDistanceToNow((date), { addSuffix: true })
    }

    // if the date is a 8 days from the current date, post the date 'Nov 13'
    if (isAfter(date, addDays(new Date(), 7) ) ) {
      dateElement.classList.add('text-gray-500')
      return format(date, 'MMM d')
    }

    dateElement.classList.add('text-purple-500')
    return format(date, 'eeee')
  }

  displayProjects(projects) {
    this.allProjects = projects
    // delete all nodes on screen
    while (this.projectOptions.firstChild) {
      // for projects in select options
      this.projectOptions.removeChild(this.projectOptions.firstChild)
    }

    while (this.menuDropdownWrapper.firstChild) {
      this.menuDropdownWrapper.removeChild(this.menuDropdownWrapper.firstChild)
    }
    console.log(projects.length)
    projects.forEach(project => {
      const li = this.createElem('li')
      li.id = project.id

      // each project will be posted in the main form in the project options  
      this.projectOption = this.createElem('option')
      this.projectOption.value = project.name
      this.projectOption.textContent = project.name

      this.projectOptions.append(this.projectOption)

      // each project will be posted in the projects dropdown as well
      let currentProjectTitle = this.getElem('#current-project-title')
      if (project.name === currentProjectTitle.textContent) {
        this.projectDropdownName = this.createElem('button', 'w-full text-green-700 dark:text-green-500 font-bold block px-4 py-2 text-sm')  
      } else {
        this.projectDropdownName = this.createElem('button', 'w-full text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm')

      }
      this.projectDropdownName.textContent = project.name
      this.menuDropdownWrapper.append(this.projectDropdownName)
    })

    if (projects.length > 5) {
      this.menuDropdownWrapper.classList.add('h-48')
    } else {
      this.menuDropdownWrapper.classList.remove('h-48')
    }
  }

  displayCurrentProject(project) {
    // display in navigation header
    let currentProjectTitle = this.getElem('#current-project-title')
    currentProjectTitle.textContent = project

    // in menu dropdown, highlight current project
    for (let projectButton of this.menuDropdownWrapper.children) {
      if (projectButton.textContent === currentProjectTitle.textContent) {
        projectButton.classList.remove('text-gray-700', 'dark:text-gray-300')
        projectButton.classList.add('text-green-700','dark:text-green-500', 'font-bold')
      } else {
        projectButton.classList.remove('text-green-700', 'dark:text-green-500', 'font-bold')
        projectButton.classList.add('text-gray-700', 'dark:text-gray-300')
      }
    }
  }

  highlightInput = (input) => {
    input.classList.remove('border-gray-300', 'dark:border-gray-600')
    input.classList.add('border-red-600', 'dark:border-red-500')
  }
  
  unhighlightInput = (input) => {
    input.classList.remove('border-red-600', 'dark:border-red-500')
    input.classList.add('border-gray-300', 'dark:border-gray-600')
  }

  bindAddTodo(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault()

      if (this._priorityGroupChecked) {
        this.unhighlightInput(this.radioGroupContainer)
      } else {
        this.highlightInput(this.radioGroupContainer)
      }

      if (this._taskTitle) {
        this.unhighlightInput(this.taskTitle)
      } else {
        this.highlightInput(this.taskTitle)
      }

      if (this._taskDesc) {
        this.unhighlightInput(this.taskDesc)
      } else {
        this.highlightInput(this.taskDesc)
      }

      if (this._taskDate) {
        this.unhighlightInput(this.taskDate)
      } else {
        this.highlightInput(this.taskDate)
      }

      if (this._priorityGroupChecked && this._taskTitle && this._taskDesc && this._taskDate) {
        console.log('[view]all form input is valid')
        console.log(`[view] this is the value of priorityValue: ${this._priorityValue}`)
        handler(this._taskTitle, this._taskDesc, this._taskDate, this._priorityValue, this._optionalNotes, this._taskProject)
        this._resetInput()
        // close form window
        this._closeFormOverlay()
      }
    })
  }

  bindAddProjectName(handler, projects) {
    this.projectNameForm.addEventListener('submit', event => {
      event.preventDefault()

      let projectNames = []

      projects.forEach(project => {
        projectNames.push(project.name)
      })

      if (this._projectName && !projectNames.includes(this._projectName)) {
        this.unhighlightInput(this.projectName)
        // handle new project name to model from controller
        handler(this._projectName)
        this._resetProjectNameInput()
        this._closeProjectNameForm()
        // close dropdown menu
      } else {
        this.highlightInput(this.projectName)
        alert('project name is invalid')
      }
    })
  }

  bindUpdateCurrentProject(handler) {
    for (let projectButton of this.menuDropdownWrapper.children) {
      projectButton.addEventListener('click', event => {
        if (event.target.textContent !== this._currentProject) {
          // update the current project in model through controller
          handler(event.target.textContent)
          // update the current project in the view
          this.currentProjectTitle.textContent = event.target.textContent
          // update nav text, menu dropdown text, and the todos to display
        } else {
          alert('That project is already selected')    
        }
        console.log('[view]close the window')
        this._closeMenuOverlay()
      })
    }
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', event => {
      if (event.target.classList.contains('delete')) {
        const id = parseInt(event.target.parentElement.parentElement.parentElement.parentElement.id)
        handler(id)
      }
    })
  }

  bindEditTodo(handler) {
    // this.todoList.addEventListener('click', event => {
    //   if (event.target.classList.contains('edit')) {
    //     const id = parseInt(event.target.parentElement.parentElement.parentElement.parentElement.id)
    //     console.log(`the id is: ${id}`)

    //     // let currentTodo = currentTodoList.find(todo => todo.id === id)
    //     console.log(`the currentTodo is ${currentTodo}`)
    //   }
    // })
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.parentElement.id)
        console.log(id)
        handler(id)
      }
    })
  }

  bindEditTitle(handler) {
    this.todoList.addEventListener('focusout', event => {
      console.log('[view][bindEditTitle]')
      console.log(this._temporaryTitle)
      if (this._temporaryTitle) {
        const id = parseInt(event.target.parentElement.parentElement.parentElement.id)
        handler(id, this._temporaryTitle)
        this._temporaryTitle = ''
      }
    })
  }

  _initEditTodoListeners() {
    // console.log(`this is the current todo list: ${currentTodoList}`)
    this.todoList.addEventListener('click', event => {
      if (event.target.classList.contains('edit')) {
        const id = parseInt(event.target.parentElement.parentElement.parentElement.parentElement.id)
        console.log(`the id is: ${id}`)
        console.log(this.allCurrentTodos)
        // get current todo
        let currentTodo = this.allCurrentTodos.find(todo => todo.id === id)

        // make an edit form for the current todo
        // ****** left off here, try to animate edit card **************
        this._createEditForm(currentTodo)

        // when clicking the edit button; bring in overlay and card openEditOverlay
        this.editOverlay.classList.remove('hidden')
        this.editCard.classList.remove('hidden')
        setTimeout(() => {
          this.editOverlay.classList.remove('invisible', 'opacity-0')
          this.editOverlay.classList.add('opacity-90')
          this.editCard.classList.remove('invisible', 'opacity-0')
          this.editCard.classList.add('opacity-100')
        }, 10);

        // when clicking out of the edit card--so clicking on the edit overlay
        this.editOverlay.addEventListener('click', event => {
          this.editOverlay.classList.remove('opacity-90')
          this.editOverlay.classList.add('opacity-0')
          this.editCard.classList.remove('opacity-100')
          this.editCard.classList.add('opacity-0')
          setTimeout(() => {
            this.editOverlay.classList.add('invisible')
            this.editCard.classList.add('invisible')
            this.editOverlay.classList.add('hidden')
            this.editCard.classList.add('hidden')
            // this.menuWrapper.classList.add('relative')
          }, 500);
        })

        
      }
    })
  }

  _createEditForm(todo) {
    console.log(`****** is todo undefined?: ${todo === undefined}`)
    this.editOverlay = this.createElem('div', 'fixed w-screen h-screen transition-opacity duration-500 ease-in-out bg-gray-900 opacity-0 invisible')
    this.editOverlay.id = 'edit-overlay'
    this.app.append(this.editOverlay)

    this.editCard = this.createElem('div', 'mt-24 overflow-y-auto h-4/5 fixed flex flex-col transition-opacity duration-500 ease-in-out opacity-0 invisible bg-white shadow-lg rounded-2xl w-3/4 p-6 dark:bg-gray-700')
    this.editCard.id = 'edit-card'
    this.app.append(this.editCard)

    // title of card
    this.editTitle = this.createElem('h1', 'text-2xl text-center mb-6 dark:text-white')
    this.editTitle.textContent = 'Edit task'

    this.editCard.append(this.editTitle)

    // edit form
    this.editForm = this.createElem('form')
    this.editForm.classList = 'grid'

    // edit form task title
    this.editTaskTitle = this.createElem('input')
    this.editTaskTitle.type = 'text'
    this.editTaskTitle.classList = 'block p-4 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
    this.editTaskTitle.placeholder = this.taskTitle.placeholder

    this.editTaskTitleLabelContainer = this.createElem('div', 'mb-2')
    this.editTaskTitleLabelContainer.append(this.taskTitleLabel, this.editTaskTitle)

    // edit form task description
    this.editTaskDesc = this.createElem('input')
    this.editTaskDesc.type = 'text'
    this.editTaskDesc.classList = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
    this.editTaskDesc.placeholder = this.taskDesc.placeholder

    this.editTaskDescContainer = this.createElem('div', 'mb-2')
    this.editTaskDescContainer.append(this.taskDescLabel, this.editTaskDesc)

    // edit form task date
    this.editTaskDate = this.createElem('input', 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
    this.editTaskDate.type = 'date'
    this.editTaskDateContainer = this.createElem('div', 'mb-2')
    this.editTaskDateContainer.append(this.taskDateLabel, this.editTaskDate)

    // edit form priority level
    this.editRadioGroup = this.createElem('div', 'radio-group')

    this.editRadioGroupLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.editRadioGroupLabel.textContent = 'Priority level'
    this.editRadioGroupContainer = this.createElem('div', 'mb-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600')
    this.editRadioGroupContainer.append(this.editRadioGroupLabel, this.editRadioGroup)  

    // https://www.tutorialspoint.com/how-to-dynamically-create-radio-buttons-using-an-array-in-javascript
    const priority = ['Low', 'Normal', 'High']
    priority.forEach((priorityValue, index) => {

      this.editSelectionContainer = this.createElem('div')
      this.editSelectionContainer.classList = 'flex items-center mb-2'

      this.editInputValue = this.createElem('input')
      this.editInputValue.type = 'radio'
      this.editInputValue.name = 'edit-priority'
      this.editInputValue.value = priorityValue
      this.editInputValue.priorityValue = index
      this.editInputValue.classList = 'w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300'

      this.editLabelValue = this.createElem('label')
      this.editLabelValue.innerHTML = priorityValue
      this.editLabelValue.classList = 'block ml-2 text-sm font-medium text-gray-900 dark:text-gray-100'

      this.editSelectionContainer.append(this.editInputValue, this.editLabelValue)

      this.editRadioGroup.append(this.editSelectionContainer)

    })

    // edit form project options
    this.editProjectOptions = this.createElem('select', 'bg-gray-50 border border-gray-300 text-gray-900 mb-2 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
    this.editProjectOptions.id = 'projects'
    this.editProjectOptions.name = 'projects'

    this.editProjectOptionsLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.editProjectOptionsLabel.textContent = 'Choose a project for the task'
    this.editProjectOptionsContainer = this.createElem('div', 'mb-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600')
    this.editProjectOptionsContainer.append(this.editProjectOptionsLabel, this.editProjectOptions)

    // const projects = ['Default project', 'Another project', 'Work project']

    this.editProjectsList = this.createElem('ul', 'edit-projects-list')
    this.editProjectOptions.append(this.editProjectsList)

    this.allProjects.forEach(project => {
      this.editProjectOption = this.createElem('option')
      this.editProjectOption.value = project.name
      this.editProjectOption.textContent = project.name

      this.editProjectOptions.append(this.editProjectOption)
    })

    // edit form project optional notes
    this.editOptionalNotes = this.createElem('input')
    this.editOptionalNotes.type = 'text'
    this.editOptionalNotes.classList = 'block p-2 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
    this.editOptionalNotes.placeholder = 'e.g., bring flashcards'
    this.editOptionalNotes.name = 'optionalNotes'

    this.editOptionalNotesLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100')
    this.editOptionalNotesLabel.textContent = 'Optional notes'
    this.editOptionalNotesContainer = this.createElem('div', 'mb-2')
    this.editOptionalNotesContainer.append(this.editOptionalNotesLabel, this.editOptionalNotes)  

    // submit button
    this.editSubmitBtn = this.createElem('button', 'mt-4 w-fit justify-self-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800')
    this.editSubmitBtn.textContent = 'Submit'
    this.editSubmitBtn.id = 'edit-submit-button'

    this.editForm.append(this.editRadioGroupContainer, this.editProjectOptionsContainer, this.editTaskTitleLabelContainer, this.editTaskDescContainer, this.editTaskDateContainer, this.editOptionalNotesContainer, this.editSubmitBtn)
    this.editCard.append(this.editForm)

    // *** set values to task values ***
    const editPriorityValues = document.getElementsByName('edit-priority')
    editPriorityValues.forEach((priority) => {
      if (priority.value == todo.priority) {
        priority.checked = true
      }
    })
    this.editProjectOptions.value = todo.project
    this.editTaskTitle.value = todo.title
    this.editTaskDesc.value = todo.description
    this.editTaskDate.value = moment(todo.date).format('YYYY-MM-DD')
    this.editOptionalNotes.value = todo.notes

    this.editSubmitBtn.addEventListener('click', event => {
      event.preventDefault()
      console.log('edit submit button')
      
    })
  }
}

// controller is link between model and view
class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    // explicit this binding
    this.model.bindTodoListChanged(this.onTodoListChanged)
    this.model.bindProjectListChanged(this.onProjectListChanged)
    this.model.bindCurrentProjectChanged(this.onCurrentProjectChanged)
    this.view.bindAddTodo(this.handleAddTodo)
    this.view.bindAddProjectName(this.handleAddProjectName, this.model.projects)
    this.view.bindEditTitle(this.handleEditTitle)
    this.view.bindDeleteTodo(this.handleDeleteTodo)
    this.view.bindEditTodo(this.handleEditTodo)
    this.view.bindToggleTodo(this.handleToggleTodo)
    this.view.bindEditTodo(this.handleEditTodo)
    
    
    // display initial projects
    this.onProjectListChanged(this.model.projects)
    
    // set initial current project
    // display initial current project in navbar
    this.onCurrentProjectChanged(this.model.currentProject)
    
    // display initial todos
    this.onTodoListChanged(this.model.todos)
  }
  
  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos)
  }

  onProjectListChanged = (projects) => {
    this.view.displayProjects(projects)
    this.view.bindUpdateCurrentProject(this.handleUpdateCurrentProject)
  }

  onCurrentProjectChanged = (currentProject) => {
    this.view.displayCurrentProject(currentProject)
  }

  handleAddTodo = (taskTitle, taskDesc, taskDate, taskPriority, optionalNotes, taskProject) => {
    this.model.addTodo(taskTitle, taskDesc, taskDate, taskPriority, optionalNotes, taskProject)
  }

  handleAddProjectName = (projectName) => {
    this.model.addProjectName(projectName)
  }

  handleUpdateCurrentProject = (currentProject) => {
    this.model.updateCurrentProject(currentProject)
  }

  handleEditTitle = (id, taskTitle) => {
    this.model.editTodoTitle(id, taskTitle)
  }

  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id)
  }

  handleToggleTodo = (id) => {
    this.model.toggleTodo(id)
  }

  handleEditTodo = (id) => {
    this.model.editTodo(id)
  }
}

const app = new Controller(new Model(), new View())