import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import $ from 'jquery'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import DraggableList from "react-draggable-lists";
import _ from "lodash";
import { v4 } from "uuid";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";


function App() {
  const [state, setState] = useState({
    todo: {
      title: "To do",
      items: []
    },
    inProgress: {
      title: "In Progress",
      items: []
    },
    done: {
      title: "Completed",
      items: []
    }
  });
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState([]);
  const handleChange = (event) => {
    if (event.target.checked) {
      $(`#task-${event.target.getAttribute('data-id')}`).attr('class', 'task alert alert-danger')
      $(`.task-${event.target.getAttribute('data-id')}`).addClass('has')
      selected.push(event.target.getAttribute('data-identifier'))
      setSelected(selected)
    } else {
      $(`#task-${event.target.getAttribute('data-id')}`).attr('class', 'task alert alert-info')
      $(`.task-${event.target.getAttribute('data-id')}`).removeClass('has')
      var filteredArray = selected.filter(e => e !== event.target.getAttribute('data-identifier'))
      setSelected(filteredArray)
    }
  };



  const handleDragEnd = ({ destination, source }) => {
    if (!destination) {
      return console.log("Not dropped inside dropable");
    }
    if (
      destination.index === source.index &&
      destination.droppableId === source.droppableId
    ) {
      console.log("dropped in same place");
    }
    if (destination.droppableId === "todo") {
      axios.put(process.env.REACT_APP_API_URL + `/api/tasks/update/${state[source.droppableId].items[source.index].identifier}`, {
        'status': 1,
      })
    } else if(destination.droppableId === "inProgress"){
      axios.put(process.env.REACT_APP_API_URL + `/api/tasks/update/${state[source.droppableId].items[source.index].identifier}`, {
        'status': 2,
      })
    } else {
      axios.put(process.env.REACT_APP_API_URL + `/api/tasks/update/${state[source.droppableId].items[source.index].identifier}`, {
        'status': 3,
      })
    }
    
    const itemCopy = { ...state[source.droppableId].items[source.index] };
    setState((prev) => {
      prev = { ...prev };
      prev[source.droppableId].items.splice(source.index, 1);
      prev[destination.droppableId].items.splice(
        destination.index,
        0,
        itemCopy
      );
      return prev;
    });
  };

  const addTask = async (event) => {
    event.preventDefault()
    var res = await axios.post(process.env.REACT_APP_API_URL + "/api/tasks/store", {
      'task': task,
      'deadline': deadline,

    }).then(function (response) {
      getTasks()
    }).catch(function (error) {

    })
  }

  const deleteTask = async (event) => {
    event.preventDefault()
    var res = await axios.post(process.env.REACT_APP_API_URL + "/api/tasks/delete", {
      'task': task,
      'deadline': deadline,

    }).then(function (response) {
      getTasks()
    }).catch(function (error) {

    })

  }
  const deleteSelectedTask = async (event) => {
    event.preventDefault()
    var res = await axios.post(process.env.REACT_APP_API_URL + "/api/tasks/delete-selected", {
      'selected': selected,
    }).then(function (response) {
      getTasks()
    }).catch(function (error) {

    })

  }

  const getTasks = async (event) => {
    var res = await axios.get(process.env.REACT_APP_API_URL + '/api/tasks')
    var data = res.data.data
    var todos = [];
    var inProgresss = [];
    var dones = [];
    data.forEach(element => {
      console.log(element)
      if (element.status === 1) {
        todos.push({ id: v4(), identifier: element.id, color: 'info', name: element.task })
      } else if (element.status === 2) {
        inProgresss.push({ id: v4(), identifier: element.id, color: 'warning', name: element.task })
      } else {
        dones.push({ id: v4(), identifier: element.id, color: 'success', name: element.task })
      }
    });

    setState({
      todo: {
        title: "To do",
        items: todos
      },
      inProgress: {
        title: "In Progress",
        items: inProgresss
      },
      done: {
        title: "Completed",
        items: dones
      }
    })
  }

  useEffect(() => {
    getTasks()
  }, []);

  return (
    <>
      <br />
      <br />
      <div className="container">
        <center>
          <h1 style={{ color: 'white', 'fontWeight': 'bold' }}>TOSSEL APP</h1>
          <p style={{ color: 'white' }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sint delectus consequatur eum adipisci. Neque quibusdam laboriosam et est minima iure enim nemo minus, laudantium corrupti laborum rerum magni molestias consectetur?
          </p>
        </center>
        <br />
        <form className="form gap-3" onSubmit={addTask}>
          <input type="text" onChange={(event) => setTask(event.target.value)} className="input" required/>
          <input type="date" onChange={(event) => setDeadline(event.target.value)} className="input" required/>
          <button type="submit" className="add" value="Add Task">Add</button>
        </form>
      </div>
      <div className="task-container d-flex gap-5" style={{ width: '80%', 'margin': 'auto' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          {_.map(state, (data, key) => {
            return (
              <div key={key} className="task-container d-flex gap-5" style={{ width: '80%', 'margin': 'auto' }}>
                <Droppable droppableId={key}>
                  {(provided) => {
                    return (
                      <div ref={provided.innerRef} className="droppable-col tasks" style={{ flex: '1' }}>
                        <center><h3 style={{ color: 'white', fontWeight: 'bold' }}>{data.title}</h3></center>
                        <br />
                        {data.items.map((el, index) => {
                          return (
                            <Draggable
                              key={el.id}
                              index={index}
                              draggableId={el.id}>
                              {(provided, snapshot) => {
                                return (
                                  <div
                                    className={`item task alert alert-${el.color} ${snapshot.isDragging && "dragging"
                                      }`} id={'task-' + el.id}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <div className="d-flex justify-content-between">
                                      <span style={{width:'300px',overflowWrap: 'break-word'}} className={'task-' + el.id}>{el.name}</span>
                                      <div className="form-check">
                                        <input className="form-check-input" type="checkbox" defaultValue id="flexCheckDefault" data-id={el.id} data-identifier={el.identifier} onChange={handleChange} />
                                      </div>
                                    </div>
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>
      <div className="container">
        <div className="d-flex gap-3 justify-content-center">
        <button onClick={deleteTask} className="btn btn-danger">Delete all</button>
        <button onClick={deleteSelectedTask} className="btn btn-danger">Delete Selected Item</button>

        </div>
      </div>
    </>
  );
}

export default App;
