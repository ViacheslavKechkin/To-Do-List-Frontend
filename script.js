let allTasks = [];
let valueInput = '';
let input = null;
let activeEditTask = null;

window.onload = async () => {
  input = document.getElementById('add-task');
  input.addEventListener('change', updateValue);
  const response = await fetch('http://localhost:8000/allTasks', {
    method: 'GET'
  });
  let result = await response.json();
  allTasks = result.data;
  render();
}

const onClickButton = async () => {
  if (input.value != '') {
    const response = await fetch('http://localhost:8000/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        text: valueInput,
        isCheck: false
      })
    });
    let result = await response.json();
    allTasks = result.data;
    valueInput = '';
    input.value = '';
    render();
  }
}

const updateValue = (event) => valueInput = event.target.value;

const render = () => {
  const content = document.getElementById('content-page');
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
  allTasks.sort((a, b) => a.isCheck > b.isCheck ? 1 : a.isCheck < b.isCheck ? -1 : 0);

  allTasks.map((item, index) => {
    const container = document.createElement('div');
    container.id = `task-${index}`;
    container.className = 'task-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.isCheck;
    checkbox.className = 'task-checkbox';
    checkbox.onchange = () => onChangeCheckbox(index);
    
    if (index === activeEditTask) {
      const inputTask = document.createElement('input');
      inputTask.type = 'text';
      inputTask.value = item.text;
      inputTask.addEventListener('change', updateTaskText);
      inputTask.addEventListener('blur', doneEditTask);
      container.appendChild(inputTask);
    } else {
      const text = document.createElement('p');
      text.innerText = item.text;
      text.className = item.isCheck ? 'text-task done-text' : 'text-task';
      container.appendChild(checkbox);
      container.appendChild(text);
    }

    if (!item.isCheck) {
      if (index === activeEditTask) {
        const imageDone = document.createElement('img');
        imageDone.src = 'img/done.png';
        imageDone.onclick = () => doneEditTask();
        container.appendChild(imageDone);
      } else {
        const imageEdit = document.createElement('img');
        imageEdit.src = 'img/edit.png';
        imageEdit.onclick = () => { 
          activeEditTask = index; 
          render();
        }
        container.appendChild(imageEdit);
      }
    }

    const imageDelete = document.createElement('img');
    imageDelete.src = 'img/delete.png';
    imageDelete.onclick = () => {
      const itemIdDel = item.id;
      deleteTask(index, itemIdDel);
    }
    container.appendChild(imageDelete);
    content.appendChild(container);
  });
}

const onChangeCheckbox = async (index) => {
  let { isCheck, text, id } = allTasks[index];
  isCheck = !isCheck;

  const response = await fetch('http://localhost:8000/updateTask', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      id,
      isCheck
    })
  });
  let result = await response.json();
  allTasks = result.data;
  render();
}

const deleteTask = async (index, itemIdDel) => {
  const response = await fetch(`http://localhost:8000/deleteTask?id=${itemIdDel}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  let result = await response.json();
  allTasks = result.data;
  render();
}

const updateTaskText = async (event) => {
  let { id, text } = allTasks[activeEditTask];
  text = event.target.value;
  const response = await fetch('http://localhost:8000/updateTask', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      id,
      text,
    })
  });
  let result = await response.json();
  allTasks = result.data;
  render();
}

const doneEditTask = () => activeEditTask = null;