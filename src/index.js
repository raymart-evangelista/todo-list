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

  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false,
    }

    console.log("todo added to list")
    this.todos.push(todo)

    this._commit(this.todos)
  }

  editTodo(id, updatedText) {
    this.todos = this.todos.map((todo) => 
    todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete} : todo,
    )

    this._commit(this.todos)
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id)

    this._commit(this.todos)
  }

  toggleTodo(id) {
    this.todos = this.todos.map((todo) =>
    todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo
    )

    this._commit(this.todos)
  }
}

// used for UI logic--such as customer view including UI components such as text boxes, dropdowns
class View {
  constructor() {
    this.app = this.getElem('#content')
    this.app.classList = 'flex flex-col items-center h-screen'

    this.title = this.createElem('h1')
    this.title.textContent = 'Todo List'

    this.form = this.createElem('form')

    this.input = this.createElem('input', 'border-4')
    this.input.type = 'text'
    this.input.placeholder = 'Add todo'
    this.input.name = 'todo'

    this.submitBtn = this.createElem('button')
    this.submitBtn.textContent = 'Submit'

    this.todoList = this.createElem('ul', 'todo-list')

    // more requirements
    this.taskTitle = this.createElem('input', 'border-4')
    this.taskTitle.type = 'text'
    this.taskTitle.placeholder = 'e.g., Learn Portuguese'
    this.taskTitle.name = 'taskTitle'

    this.taskDesc = this.createElem('input', 'border-4')
    this.taskDesc.type = 'text'
    this.taskDesc.placeholder = 'Description'
    this.taskDesc.name = 'taskDesc'

    this.taskDate = this.createElem('input', 'border-4')
    this.taskDate.type = 'date'
    this.taskDate.value = moment().format('YYYY-MM-DD')
    this.taskDate.name = 'taskDate'


    this.radioGroup = this.createElem('div', 'radio-group')

    // const lowPriority = 'Low'
    // this.lowPriorityLabel = this.createElem('label')
    // this.lowPriorityLabel.innerHTML = 'Low'
    // this.lowPriorityValue = this.createElem('input', 'border-4')
    // this.lowPriorityValue.type = 'radio'
    // this.lowPriorityValue.name = 'Low'
    // this.lowPriorityValue.lowPriority = 0

    const priority = ['Low', 'Normal', 'High']
    priority.forEach((priorityValue, index) => {
      this.labelValue = this.createElem('label')
      this.labelValue.innerHTML = priorityValue
      this.inputValue = this.createElem('input')
      this.inputValue.type = 'radio'
      this.inputValue.name = 'priority'
      this.inputValue.priorityValue = index
      this.radioGroup.append(this.labelValue, this.inputValue)
    })

    // this.radioGroup.append(this.lowPriorityLabel, this.lowPriorityValue)
    this.form.append(this.radioGroup)


    this.taskPriority = this.createElem('input', 'border-4')
    this.taskPriority.type = 'radio'


    // append
    this.form.append(this.taskTitle, this.taskDesc, this.taskDate, this.input, this.submitBtn)
    this.app.append(this.title, this.form, this.todoList)

    this._temporaryTodoText = ''
    this._initLocalListeners()
  }

  get _todoText() {
    return this.input.value
  }

  _resetInput() {
    this.input.value = ''
  }

  _initLocalListeners() {
    this.todoList.addEventListener('input', event => {
      if (event.target.className === 'editable') {
        this._temporaryTodoText = event.target.innerText
      }
    })
  }

  createElem(tag, className) {
    const element = document.createElement(tag)
    if (className) {
      element.classList.add(className)
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
        span.classList.add('editable')

        // if todo completed, add strikethrough
        if (todo.complete) {
          const strike = this.createElem('s')
          strike.textContent = todo.text
          span.append(strike)
        } else {
          span.textContent = todo.text
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

  bindAddTodo(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault()

      if (this._todoText) {
        handler(this._todoText)
        this._resetInput()
      } else {
        alert("Fill in sections")
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

  bindEditTodo(handler) {
    this.todoList.addEventListener('focusout', event => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id)

        handler(id, this._temporaryTodoText)
        this._temporaryTodoText = ''
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
    this.view.bindEditTodo(this.handleEditTodo)
    this.view.bindDeleteTodo(this.handleDeleteTodo)
    this.view.bindToggleTodo(this.handleToggleTodo)

    // display initial todos
    this.onTodoListChanged(this.model.todos)
  }
  
  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos)
  }

  handleAddTodo = (todoText) => {
    this.model.addTodo(todoText)
  }

  handleEditTodo = (id, todoText) => {
    this.model.editTodo(id, todoText)
  }

  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id)
  }

  handleToggleTodo = (id) => {
    this.model.toggleTodo(id)
  }
}

const app = new Controller(new Model(), new View())
// app.model.addTodo('Take a nap')