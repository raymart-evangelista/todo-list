import './style.css'


// home button

// today button

// upcoming button

// projects -> list of all projects

//  add project

// following for MVC https://www.taniarascia.com/javascript-mvc-todo-app/

// the model works with data
class Model {
  constructor() {
    this.todos = [
      {id: 1, text: 'Run a marathon', complete: false},
      {id: 2, text: 'Plant a garden', complete: false},
    ]
  }

  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false,
    }

    console.log("todo added to list")
    this.todos.push(todo)
  }

  editTodo(id, updatedText) {
    this.todos = this.todos.map((todo) => 
    todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete} : todo,
    )
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id)

    this.onTodoListChanged(this.todos)
  }

  toggleTodo(id) {
    this.todos = this.todos.map((todo) =>
    todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo
    )
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback
  }
}

// used for UI logic--such as customer view including UI components such as text boxes, dropdowns
class View {
  constructor() {
    this.app = this.getElem('#content')
    this.app.classList = 'flex flex-col'

    this.title = this.createElem('h1')
    this.title.textContent = 'Todos'

    this.form = this.createElem('form')

    this.input = this.createElem('input', 'border-4')
    this.input.type = 'text'
    this.input.placeholder = 'Add todo'
    this.input.name = 'todo'

    this.submitBtn = this.createElem('button')
    this.submitBtn.textContent = 'Submit'

    this.todoList = this.createElem('ul', 'todo-list')

    this.form.append(this.input, this.submitBtn)

    this.app.append(this.title, this.form, this.todoList)
  }

  get _todoText() {
    return this.input.value
  }

  _resetInput() {
    this.input.value = ''
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
      const p = this.createElement('p')
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
        this._resetInput
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
}

// controller is link between model and view
class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    // display initial todos
    this.onTodoListChanged(this.model.todos)
  }
  
  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos)
    this.model.bindTodoListChanged(this.onTodoListChanged)
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