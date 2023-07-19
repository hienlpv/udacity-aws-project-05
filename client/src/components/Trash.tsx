import { History } from 'history'
import * as React from 'react'
import { Button, Divider, Grid, Header, Icon, Image, Loader } from 'semantic-ui-react'

import { deleteTodo, getTodos, restoreTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TrashProps {
  auth: Auth
  history: History
}

interface TrashState {
  todos: Todo[]
  loadingTodos: boolean
}

export class Trash extends React.PureComponent<TrashProps, TrashState> {
  state: TrashState = {
    todos: [],
    loadingTodos: true
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken(), true)
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Trash</Header>
        {this.renderTodos()}
      </div>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  onRestoreBtnClick = async (todoId: string) => {
    try {
      this.setState({ todos: [], loadingTodos: true })
      await restoreTodo(this.props.auth.getIdToken(), todoId)
      let todos = await getTodos(this.props.auth.getIdToken(), true)
      this.setState({ todos, loadingTodos: false })
    } catch {
      alert('Todo restore failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter((todo) => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={11} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="facebook"
                  onClick={() => this.onRestoreBtnClick(todo.todoId)}
                >
                  <Icon name="redo" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
