import './style.css'
import { format, compareAsc } from 'date-fns'
import moment from 'moment'
import logo from './icons/check-square.svg'
import menu from './icons/menu.svg'
import down from './icons/chevron-down.svg'

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
    // this.projects = JSON.parse(localStorage.getItem('projects')) || []
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback
  }

  _commit(todos) {
    this.onTodoListChanged(todos)
    localStorage.setItem('todos', JSON.stringify(todos))
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

    console.log("todo added to list")
    this.todos.push(todo)

    this._commit(this.todos)
  }

  editTodoTitle(id, updatedTitle) {
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
    this.app = this.getElem('#content')
    this.app.classList = 'flex flex-col items-center h-screen'

    this.newTaskBtn = this.getElem('#newTask')

    this.overlay = this.createElem('div')
    this.overlay.id = 'overlay'
    this.overlay.classList = 'fixed w-screen h-screen transition-opacity duration-500 ease-in-out bg-gray-900 opacity-0 invisible'
    this.app.append(this.overlay)

    this.overlayCard = this.createElem('div')
    this.overlayCard.id = 'overlayCard'
    this.overlayCard.classList = 'overflow-y-auto h-4/5 fixed flex flex-col transition-opacity duration-500 ease-in-out opacity-0 invisible bg-white shadow-lg rounded-2xl w-3/4 mt-6 p-6'
    this.app.append(this.overlayCard)

    this.title = this.createElem('h1', 'text-2xl text-center mb-6')
    this.title.textContent = 'Add a new task'

    this.form = this.createElem('form')
    this.form.classList = 'grid'

    this.submitBtn = this.createElem('button', 'mt-4 w-fit justify-self-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800')
    this.submitBtn.textContent = 'Submit'

    this.todoList = this.createElem('ul', 'todo-list')

    // task title
    this.taskTitle = this.createElem('input')
    this.taskTitle.type = 'text'
    this.taskTitle.classList = 'block p-4 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-md focus:ring-blue-500 focus:border-blue-500'
    this.taskTitle.placeholder = 'e.g., Learn Portuguese'
    this.taskTitle.name = 'taskTitle'

    this.taskTitleLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900')
    this.taskTitleLabel.textContent = 'Task title'
    this.taskTitleContainer = this.createElem('div', 'mb-2')
    this.taskTitleContainer.append(this.taskTitleLabel, this.taskTitle)

    // task description
    this.taskDesc = this.createElem('input')
    this.taskDesc.type = 'text'
    this.taskDesc.classList = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
    this.taskDesc.placeholder = 'e.g., Hour long session'
    this.taskDesc.name = 'taskDesc'

    this.taskDescLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900')
    this.taskDescLabel.textContent = 'Description'
    this.taskDescContainer = this.createElem('div', 'mb-2')
    this.taskDescContainer.append(this.taskDescLabel, this.taskDesc)  

    // task date
    this.taskDate = this.createElem('input', 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5')
    this.taskDate.type = 'date'
    this.taskDate.value = moment().format('YYYY-MM-DD')
    this.taskDate.name = 'taskDate'

    this.taskDateLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900')
    this.taskDateLabel.textContent = 'Date'
    this.taskDateContainer = this.createElem('div', 'mb-2')
    this.taskDateContainer.append(this.taskDateLabel, this.taskDate)  

    // task optional notes
    this.optionalNotes = this.createElem('input')
    this.optionalNotes.type = 'text'
    this.optionalNotes.classList = 'block p-2 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-xs focus:ring-blue-500 focus:border-blue-500'
    this.optionalNotes.placeholder = 'e.g., bring flashcards'
    this.optionalNotes.name = 'optionalNotes'

    this.optionalNotesLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900')
    this.optionalNotesLabel.textContent = 'Optional notes'
    this.optionalNotesContainer = this.createElem('div', 'mb-2')
    this.optionalNotesContainer.append(this.optionalNotesLabel, this.optionalNotes)  

    // task priority level
    this.radioGroup = this.createElem('div', 'radio-group')

    this.radioGroupLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900')
    this.radioGroupLabel.textContent = 'Priority level'
    this.radioGroupContainer = this.createElem('div', 'mb-2 p-2 rounded-lg border border-gray-300')
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
      this.labelValue.classList = 'block ml-2 text-sm font-medium text-gray-900'

      this.selectionContainer.append(this.inputValue, this.labelValue)

      this.radioGroup.append(this.selectionContainer)
    })

    // project options
    this.projectOptions = this.createElem('select', 'bg-gray-50 border border-gray-300 text-gray-900 mb-2 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
    this.projectOptions.id = 'projects'
    this.projectOptions.name = 'projects'

    this.projectOptionsLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900')
    this.projectOptionsLabel.textContent = 'Choose a project for the task'
    this.projectOptionsContainer = this.createElem('div', 'mb-2 p-2 rounded-lg border border-gray-300')
    this.projectOptionsContainer.append(this.projectOptionsLabel, this.projectOptions)

    const projects = ['Default project', 'Another project', 'Work project']
    projects.forEach((project, index) => {

      this.projectOption = this.createElem('option')
      this.projectOption.value = project
      this.projectOption.textContent = project

      this.projectOptions.append(this.projectOption)
    })

    // navbar 
    this.navbar = this.createElem('nav', 'w-screen p-3 bg-gray-50 rounded border-gray-200 dark:bg-gray-800 dark:border-gray-700')
    this.navbarContainer = this.createElem('div', 'flex justify-between')
    this.logoContainer = this.createElem('a', 'flex items-center')
    this.logoImg = this.createElem('img', 'mr-1 h-6 sm:h-10')
    this.logoImg.src = logo
    this.logoText = this.createElem('span', 'self-center text-xl font-semibold whitespace-nowrap dark:text-white')
    this.logoText.textContent = 'Todo List'
    
    this.logoContainer.append(this.logoImg, this.logoText)

    // this.menuBtn = this.createElem('button', 'inline-flex justify-center items-center text-gray-400 rounded-lg hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-gray-400 dark:hover:text-white dark:focus:ring-gray-500')
    this.menuBtn = this.createElem('button', 'inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100')
    this.menuWrapper = this.createElem('div', 'relative inline-block text-left')
    this.menuWrapper2 = this.createElem('div')

    
    this.menuText = this.createElem('span', 'p-1')
    this.menuText.textContent = 'Projects'
    this.menuLogo = this.createElem('img', 'p-.5')
    this.menuLogo.src = down
    
    this.menuBtnContents = this.createElem('div', 'flex')
    this.menuBtnContents.append(this.menuText, this.menuLogo)
    
    this.menuWrapper.append(this.menuWrapper2)
    this.menuWrapper2.append(this.menuBtn)
    this.menuBtn.append(this.menuBtnContents)

    // project menu dropdown
    this.menuDropdown = this.createElem('div', 'transition-opacity duration-150 ease-in-out opacity-0 hidden invisible absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100')
    this.menuDropdown.id = 'menu-dropdown'
    this.menuDropdownWrapper = this.createElem('div', 'py-1')

    this.menuDropdown.append(this.menuDropdownWrapper)
    this.menuWrapper.append(this.menuDropdown)

    this.defaultProject = this.createElem('button', 'w-full text-gray-700 block px-4 py-2 text-sm')
    this.defaultProject.textContent = 'Default project'

    this.exampleProject = this.createElem('button', 'w-full text-gray-700 block px-4 py-2 text-sm')
    this.exampleProject.textContent = 'Example project'

    this.menuDropdownWrapper.append(this.defaultProject, this.exampleProject)

    // for new project 
    this.menuDropdownWrapper2 = this.createElem('div', 'py-1')
    this.newProjectBtn = this.createElem('button', 'w-full text-gray-700 block px-4 py-2 text-sm')
    this.newProjectBtn.textContent = 'New project'
    this.menuDropdownWrapper2.append(this.newProjectBtn)

    this.menuDropdown.append(this.menuDropdownWrapper2)


    // project name form
    this.projectForm = this.createElem('form', 'absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 p-4')

    this.projectName = this.createElem('input', 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5')
    this.projectName.type = 'text'
    this.projectName.placeholder = 'e.g., Computer Science'
    this.projectName.name = 'projectName'

    this.projectNameLabel = this.createElem('label', 'block mb-2 text-sm font-medium text-gray-900')
    this.projectNameLabel.textContent = 'Name your new project'
    this.projectNameContainer = this.createElem('div', 'mb-2')
    this.projectNameContainer.append(this.projectNameLabel, this.projectName)
    
    this.menuDropdown.append(this.projectForm)
    this.projectNameSubmitBtn = this.createElem('button', 'mt-2 w-fit justify-self-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800')
    this.projectNameSubmitBtn.textContent = 'Submit'

    this.projectForm.append(this.projectNameContainer, this.projectNameSubmitBtn)

    // dropdown overlay
    this.menuOverlay = this.createElem('div', 'fixed w-screen h-screen transition-opacity duration-500 ease-in-out bg-gray-900 opacity-0 hidden invisible')
    this.menuOverlay.id = 'menu-overlay'
    this.app.append(this.menuOverlay)

    this.navbarContainer.append(this.logoContainer, this.menuWrapper)
    this.navbar.append(this.navbarContainer)

    // append
    this.app.append(this.navbar)
    this.app.append(this.todoList)
    this.form.append(this.radioGroupContainer, this.projectOptionsContainer)
    this.form.append(this.taskTitleContainer, this.taskDescContainer, this.taskDateContainer, this.optionalNotesContainer, this.submitBtn)
    this.overlayCard.append(this.title, this.form)

    this._temporaryTitle = ''
    this._initLocalListeners()
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
    const priorityValues = document.getElementsByName('priority')
    priorityValues.forEach((priority) => {
      if (priority.checked) {
        return priority.value
      }
    })
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

  _initLocalListeners() {
    this.todoList.addEventListener('input', event => {
      if (event.target.className === 'editable-title') {
        this._temporaryTitle = event.target.innerText
      }
    })

    this.newTaskBtn.addEventListener('click', event => {
      console.log('show overlay')
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
      console.log('hide overlay')
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
        this.menuDropdown.classList.remove('opacity-100')
        this.menuDropdown.classList.add('opacity-0')

        this.menuOverlay.classList.remove('opacity-90')
        this.menuOverlay.classList.add('opacity-0')
        setTimeout(() => {
          this.menuDropdown.classList.add('invisible')
          this.menuDropdown.classList.add('hidden')

          this.menuOverlay.classList.add('invisible', 'hidden')
        }, 500);
      }

    })

    this.menuOverlay.addEventListener('click', event => {
      this.menuDropdown.classList.remove('opacity-100')
      this.menuDropdown.classList.add('opacity-0')

      this.menuOverlay.classList.remove('opacity-90')
      this.menuOverlay.classList.add('opacity-0')
      setTimeout(() => {
        this.menuDropdown.classList.add('invisible')
        this.menuDropdown.classList.add('hidden')

        this.menuOverlay.classList.add('invisible', 'hidden')
      }, 500);
    })

    this.newProjectBtn.addEventListener('click', event => {
      console.log('new project')
      // initiate new project form
    })
    
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

    // show default message
    if (todos.length === 0) {
      const p = this.createElem('p')
      p.textContent = 'Nothing to do! Add a task?'
      this.todoList.append(p)
    } else {
      // create todo item nodes for each todo in state
      todos.forEach(todo => {
        const li = this.createElem('li')
        li.id = todo.id

        // each todo item will have a checkbox you can toggle
        const checkbox = this.createElem('input')
        checkbox.type = 'checkbox'
        checkbox.checked = todo.complete

        // todo item text will be in a contenteditable span
        const span = this.createElem('span')
        span.contentEditable = true
        span.classList.add('editable-title')

        // if todo completed, add strikethrough
        if (todo.complete) {
          const strike = this.createElem('s')
          strike.textContent = todo.title
          span.append(strike)
        } else {
          span.textContent = todo.title
        }

        // todos have a delete button
        const deleteBtn = this.createElem('button', 'delete')
        deleteBtn.textContent = 'Delete'
        li.append(checkbox, span, deleteBtn)

        // append nodes to the todo list
        this.todoList.append(li)
      })
    }
  }

  highlightInput = (input) => {
    input.classList.remove('border-gray-300')
    input.classList.add('border-red-600')
  }
  
  unhighlightInput = (input) => {
    input.classList.remove('border-red-600')
    input.classList.add('border-gray-300')
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
        console.log('all input valid')
        handler(this._taskTitle, this._taskDesc, this._taskDate, this._priorityValue, this._optionalNotes, this._taskProject)
        this._resetInput()
      }
    })
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id)

        handler(id)
      }
    })
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)

        handler(id)
      }
    })
  }

  bindEditTitle(handler) {
    this.todoList.addEventListener('focusout', event => {
      if (this._temporaryTitle) {
        const id = parseInt(event.target.parentElement.id)

        handler(id, this._temporaryTitle)
        this._temporaryTitle = ''
      }
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
    this.view.bindAddTodo(this.handleAddTodo)
    this.view.bindEditTitle(this.handleEditTitle)
    this.view.bindDeleteTodo(this.handleDeleteTodo)
    this.view.bindToggleTodo(this.handleToggleTodo)

    // display initial todos
    this.onTodoListChanged(this.model.todos)
  }
  
  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos)
  }

  handleAddTodo = (taskTitle, taskDesc, taskDate, taskPriority, optionalNotes, taskProject) => {
    this.model.addTodo(taskTitle, taskDesc, taskDate, taskPriority, optionalNotes, taskProject)
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
}

const app = new Controller(new Model(), new View())