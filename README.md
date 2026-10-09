# React Todo App

A task manager built with React and TypeScript on top of a REST API. Tasks are loaded from and saved to the server, with loading and error states for every request.

**Live demo:** https://pobedasg.github.io/react_todo-app-with-api/

## Features

- Add, delete and complete tasks (CRUD through a REST API)
- Rename a task on double click: save with Enter or on blur, cancel with Esc, an empty title deletes the task
- Toggle all tasks at once and clear the completed ones
- Filter by status: all, active, completed
- Validation of empty titles
- Loading overlay on the task being changed and error notifications when a request fails

## Tech stack

React 18 · TypeScript · Vite · SCSS · Bulma

## Project structure

```
src/
  api/          requests to the server
  components/   NewTodo, TodoList, TodoItem, Filter, Footer, ErrorNotification
  constants/    error messages
  types/        Todo and FilterStatus types
  utils/        fetch client and filtering helpers
```

## Run locally

```bash
git clone https://github.com/Pobedasg/react_todo-app-with-api.git
cd react_todo-app-with-api
git checkout developo
npm install
npm start
```

## About this project

This is a Mate academy course project, so the repository started from their template (lint, format and deploy scripts come from it). The application code in `src/` is mine. The original task description is in the [Mate academy repository](https://github.com/mate-academy/react_todo-app-with-api).
