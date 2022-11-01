import './style.css'
import { format, compareAsc } from 'date-fns'
import moment from 'moment'


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
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback
  }

  _commit(todos) {
    this.onTodoListChanged(todos)
    localStorage.setItem('todos', JSON.stringify(todos))
  }

  addTodo(taskTitle, taskDesc, taskDate, priorityValue, optionalNotes ) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      title: taskTitle,
      description: taskDesc,
      date: taskDate,
      priority: priorityValue,
      notes: optionalNotes,

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
    this.overlay.classList = 'fixed w-screen h-screen transition-opacity delay-100 duration-500 ease-in-out bg-gray-900 opacity-0 invisible'
    this.app.append(this.overlay)

    this.overlayCard = this.createElem('div')
    this.overlayCard.id = 'overlayCard'
    this.overlayCard.classList = 'fixed transition-opacity delay-100 duration-500 ease-in-out opacity-0 invisible bg-white shadow-lg shadow-gray-200 rounded-2xl p-4 sm:p-6 xl:p-8 mb-6'
    this.app.append(this.overlayCard)

    this.title = this.createElem('h1')
    this.title.textContent = 'Todo List'

    this.form = this.createElem('form')
    this.form.classList = 'grid'

    this.submitBtn = this.createElem('button')
    this.submitBtn.textContent = 'Submit'

    this.todoList = this.createElem('ul', 'todo-list')

    // more requirements
    this.taskTitleLabel = this.createElem('label')

    this.taskTitle = this.createElem('input')
    this.taskTitle.type = 'text'
    this.taskTitle.classList = 'block p-4 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-md focus:ring-blue-500 focus:border-blue-500'
    this.taskTitle.placeholder = 'e.g., Learn Portuguese'
    this.taskTitle.name = 'taskTitle'

    this.taskDesc = this.createElem('input')
    this.taskDesc.type = 'text'
    this.taskDesc.classList = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
    this.taskDesc.placeholder = 'Description'
    this.taskDesc.name = 'taskDesc'

    this.taskDate = this.createElem('input', 'border-4')
    this.taskDate.type = 'date'
    this.taskDate.value = moment().format('YYYY-MM-DD')
    this.taskDate.name = 'taskDate'

    this.optionalNotes = this.createElem('input')
    this.optionalNotes.type = 'text'
    this.optionalNotes.classList = 'block p-2 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-xs focus:ring-blue-500 focus:border-blue-500'
    this.optionalNotes.placeholder = 'Optional notes'
    this.optionalNotes.name = 'optionalNotes'

    this.radioGroup = this.createElem('div', 'radio-group')

    // https://www.tutorialspoint.com/how-to-dynamically-create-radio-buttons-using-an-array-in-javascript
    const priority = ['Low', 'Normal', 'High']
    priority.forEach((priorityValue, index) => {

      this.selectionContainer = this.createElem('div')
      this.selectionContainer.classList = 'flex items-center mb-4'

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
    

    // append
    this.form.append(this.radioGroup)
    this.form.append(this.taskTitle, this.taskDesc, this.taskDate, this.optionalNotes, this.submitBtn)
    this.overlayCard.append(this.title, this.form, this.todoList)

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
      this.overlay.classList.remove('invisible', 'opacity-0')
      this.overlay.classList.add('opacity-90')

      this.overlayCard.classList.remove('invisible', 'opacity-0')
      this.overlayCard.classList.add('opacity-100')
    })

    this.overlay.addEventListener('click', event => {
      console.log('hide overlay')
      this.overlay.classList.remove('opacity-90')
      this.overlay.classList.add('opacity-0')

      this.overlayCard.classList.remove('opacity-100')
      this.overlayCard.classList.add('opacity-0')
      setTimeout(() => {
        this.overlay.classList.add('invisible')
      }, 500);
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
    input.classList.add('border-4')
    input.classList.add('border-red-500')
  }
  
  unhighlightInput = (input) => {
    input.classList.remove('border-red-500')
  }

  bindAddTodo(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault()

      if (this._priorityGroupChecked) {
        this.unhighlightInput(this.radioGroup)
      } else {
        this.highlightInput(this.radioGroup)
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
        handler(this._taskTitle, this._taskDesc, this._taskDate, this._priorityValue, this._optionalNotes)
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

  handleAddTodo = (taskTitle, taskDesc, taskDate, taskPriority, optionalNotes) => {
    this.model.addTodo(taskTitle, taskDesc, taskDate, taskPriority, optionalNotes)
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