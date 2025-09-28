import JestTest from './components/JestTest/JestTest'
import { TaskJSONService } from './services/taskJSONService'
import { useState, useEffect } from 'react'
import { type Task } from './services/types'

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const taskService = new TaskJSONService();
  useEffect(() => {
    taskService.getTasks().then(setTasks);
  }, []);

  return (
    <>
      <JestTest />
      <h1>Tasks</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </>
  )
}

export default App
