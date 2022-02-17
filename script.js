
//получаю данный из localStorage если их там нет, получаю пустой массив
let allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
let valueInput = '';
let input = null;
let activeEditTask = null;

//с помощью async сделал асинхронную функцию 
//она будет ждать пока придет ответ с сервера http://
window.onload = async function init() {
  //инпуту добавили поиск по aйди
  input = document.getElementById('add-task');
  //инпуту добавили слушатель изменений
  input.addEventListener('change', updateValue);
  //функция ждет ответ с сервера (fetch - метод для сетевого запроса) запрос на получения данных
  const response = await fetch('http://localhost:8000/allTasks', {
    method: 'GET'
  });
  //как только получу ответ от response, беру данные и приобразовываю данные в json формат 
  let result = await response.json();
  console.log('result', result);
  //перезаписываю полученые данные в allTasks (data потому что данные приходят в свойство data у result)
  allTasks = result.data;
  console.log('GET allTasks', allTasks);
  //render делаю потому что получил данные из locakStorage и нужно их отобразить
  render();
}


onClickButton = async () => {

  if (input.value != '') {
    allTasks.push({
      text: valueInput,
      isCheck: false
    });
    //функция ждет ответ с сервера (fetch - метод для сетевого запроса) запрос на изменение данных
    const response = await fetch('http://localhost:8000/createTask', {
      method: 'POST',
      headers: {
        //описываем в каком формате отдаем данные и в каком должен принимать их сервер
        'Content-Type': 'application/json;charset=utf-8',
        //указываем разрешение на локальное приложение
        'Access-Control-Allow-Origin': '*'
      },
      // в body информация о новом таске (скопировал то что пушил в allTasks)
      body: JSON.stringify({
        text: valueInput,
        isCheck: false
      })
    });
    //как только получу ответ от response, беру данные и приобразовываю данные в json формат 
    let result = await response.json();
    //перезаписываю полученые данные в allTasks (data потому что данные приходят в свойство data у result)
    allTasks = result.data;
    console.log('result', allTasks);
    //сохраняю данные в locakStorage когда произошли какие либо изменения
    //в массиве allTasks
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    //чистим что бы данные не дублировались
    valueInput = '';
    input.value = '';
    //вызываем отрисовку
    render();
  }
}
//получаем значение изменения в инпуте
updateValue = (event) => {
  valueInput = event.target.value;
}

// функция рендора задач
render = () => {
  const content = document.getElementById('content-page');
  //удаляем старые дочерние элементы что бы не дублировались при добавлении
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
  //сортировка для отображения выполненых элементов в конце
  allTasks.sort((a, b) => a.isCheck > b.isCheck ? 1 : a.isCheck < b.isCheck ? -1 : 0);

  allTasks.map((item, index) => {
    //Добавляю контейнер для задачи
    const container = document.createElement('div');
    container.id = `task-${index}`;
    container.className = 'task-container';

    //Добавляю чекбокс в контейнер
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.isCheck;
    checkbox.className = 'task-checkbox';
    checkbox.onchange = function () {
      onChangeCheckbox(index);
    };
    container.appendChild(checkbox);

    //Проверяю и если инпут не равен оставляю текст
    if (index === activeEditTask) {
      const inputTask = document.createElement('input');
      inputTask.type = 'text';
      inputTask.value = item.text;
      inputTask.addEventListener('change', updateTaskText);
      inputTask.addEventListener('blur', doneEditTask);
      container.appendChild(inputTask);
    } else {
      //Добавляю текст таски в контейнер
      const text = document.createElement('p');
      text.innerText = item.text;
      text.className = item.isCheck ? 'text-task done-text' : 'text-task';
      container.appendChild(text);
    }

    //проверка если задача выполнена то сюда не заходить
    if (!item.isCheck) {
      if (index === activeEditTask) {
        const imageDone = document.createElement('img');
        imageDone.src = 'img/done.png';
        imageDone.onclick = function () {
          doneEditTask();
        };
        container.appendChild(imageDone);
      } else {
        //Добавляю картинку для изменения задачи
        const imageEdit = document.createElement('img');
        imageEdit.src = 'img/edit.png';
        imageEdit.onclick = function () {
          activeEditTask = index;
          render();
        }
        container.appendChild(imageEdit);
      }

    }
    //Добавляю картинку для удаления задачи
    const imageDelete = document.createElement('img');
    imageDelete.src = 'img/delete.png';
    imageDelete.onclick = function () {
      let itemIdDel = item.id;
      deleteTask(index, itemIdDel);
    }
    container.appendChild(imageDelete);

    //Добавляю сформированный контейре в контент на странице
    content.appendChild(container);
  });
}

//функция изменения состаяния чекбокса
onChangeCheckbox = async (index) => {
  allTasks[index].isCheck = !allTasks[index].isCheck;

  const response = await fetch('http://localhost:8000/updateTask', {
    method: 'PATCH',
    headers: {
      //описываем в каком формате отдаем данные и в каком должен принимать их сервер
      'Content-Type': 'application/json;charset=utf-8',
      //указываем разрешение на локальное приложение
      'Access-Control-Allow-Origin': '*'
    },
    // в body информация о новом таске
    body: JSON.stringify({
      id: allTasks[index].id,
      text: allTasks[index].text,
      isCheck: allTasks[index].isCheck
    })
  });
  //как только получу ответ от response, беру данные и приобразовываю данные в json формат 
  let result = await response.json();
  //перезаписываю полученые данные в allTasks (data потому что данные приходят в свойство data у result)
  allTasks = result.data;
  //сохраняю данные в locakStorage когда произошли какие либо изменения
  //в массиве allTasks
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}
//функция удаления задачи
deleteTask = async (index, itemIdDel) => {
  allTasks.splice(index, 1);
  //функция ждет ответ с сервера (fetch - метод для сетевого запроса) запрос на изменение данных
  const response = await fetch(`http://localhost:8000/deleteTask?id=${itemIdDel}`, {
    method: 'DELETE',
    headers: {
      //описываем в каком формате отдаем данные и в каком должен принимать их сервер
      'Content-Type': 'application/json;charset=utf-8',
      //указываем разрешение на локальное приложение
      'Access-Control-Allow-Origin': '*'
    },
  });
  //как только получу ответ от response, беру данные и приобразовываю данные в json формат 
  let result = await response.json();
  //перезаписываю полученые данные в allTasks (data потому что данные приходят в свойство data у result)
  allTasks = result.data;

  //сохраняю данные в locakStorage когда произошли какие либо изменения
  //в массиве allTasks
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

updateTaskText = async (event) => {
  allTasks[activeEditTask].text = event.target.value;
  //функция ждет ответ с сервера (fetch - метод для сетевого запроса) запрос на изменение данных
  const response = await fetch('http://localhost:8000/updateTask', {
    method: 'PATCH',
    headers: {
      //описываем в каком формате отдаем данные и в каком должен принимать их сервер
      'Content-Type': 'application/json;charset=utf-8',
      //указываем разрешение на локальное приложение
      'Access-Control-Allow-Origin': '*'
    },
    // в body информация о новом таске
    body: JSON.stringify({
      id: allTasks[activeEditTask].id,
      text: allTasks[activeEditTask].text,
      isCheck: false
    })
  });
  //как только получу ответ от response, беру данные и приобразовываю данные в json формат 
  let result = await response.json();
  //перезаписываю полученые данные в allTasks (data потому что данные приходят в свойство data у result)
  allTasks = result.data;
  console.log('PATCH allTasks', allTasks);

  //сохраняю данные в locakStorage когда произошли какие либо изменения
  //в массиве allTasks
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

doneEditTask = () => {
  activeEditTask = null;
  render();
}