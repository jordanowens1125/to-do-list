//localStorage.clear()

//next steps are at the bottom
//get all of the objects stored in local storage into the projects list
let priorities =['low','medium','high']
let itemsList =[]
let projects=[]
let projectSearchObj={}

//saved frequently used document elements
let itemForm=document.getElementById('new-to-do-list-form');
let projectTable= document.getElementById('project-items-table')
let projectDisplay = document.getElementById('project-display')
let projectForm=document.getElementById('new-project-form') 
let projectTitle=document.getElementById('project-title')
let deleteButton=document.getElementById('project-delete')
let editProjectButton=document.getElementById('project-edit')
let projectSubmit=document.getElementById('projectSubmit')

//function to retrieve local storage
//Each project title is used as the key to the project object which is stored as the value
function retrieveData(){
  //we will reference the actual project object lists to display projects and their properties
  projects=[]
  if (localStorage.length!=0){
    for (let [key, value] of Object.entries(localStorage)) {
      //get project with the key name and save it
      savedProject=JSON.parse(localStorage.getItem(`${key}`))
      //add the saved project to the projects list
      projects.push(savedProject)
      //add saved project to the this object for searching
      projectSearchObj[key]=value
    }
  }
}

//create a project
const projectFactory= (title)=> {
  let items=[]
  ;
  return{
    title,
    items
    }
  }
//function to set project to complete if all 
 //of its items are complete
//create a to do list item
const itemFactory= (title, description,projectIndex, priorityIndex,duedate, status=false) =>{
  function changePriorityIndex(index){
    this.priorityIndex=index
  }
  function changeTitle(newTitle){
    this.title = newTitle
  }
  function changeDescription(newDescription){
    this.description = newDescription
  }
  function changeProject(projectIndex){
    this.projectIndex = projectIndex
  }
  function changeDueDate(newDueDate){
    this.duedate = newDueDate
  }
  function changeStatus(newStatus){
    this.status = newStatus
  }
  return{ title, description,projectIndex,priorityIndex,duedate,status,
    changeTitle,changeDescription,changeProject,changeDueDate,changeStatus,changePriorityIndex
  }
}

//add a new project to the projects list
function addNewProject(project){
  projects.push(project)
  //using project title to save the projects in local storage
  localStorage.setItem(`${project.title}`,JSON.stringify(project))
  //stores project title
  projectSearchObj[project.title]=project
}

//add extra project prop 
//since i could not retrieve them from local storage
function addProjectProps(project){
  project.addItem= function(item){
    project.items.push(item)
  }
  project.deleteItem=function(index){
    project.items.splice(index,1)
    localStorage.removeItem(`${project.title}`)
    localStorage.setItem(`${project.title}`,JSON.stringify(project))
  }
  project.save=function(){
    localStorage.removeItem(`${project.title}`)
    localStorage.setItem(`${project.title}`,JSON.stringify(project))
  }

  project.deleteProject=function(){
    localStorage.removeItem(`${project.title}`)
  }
  project.editTitle=function(newTitle){
    //remove old title first
    localStorage.removeItem(`${project.title}`)
    //then make new title
    project.title=newTitle
    localStorage.setItem(`${project.title}`,JSON.stringify(project))
    projectSearchObj[project.title]=project
  }
}

//make sure item name does not appear as a name of another item in this project 
function validateItemName(title,project){
  let valid = itemForm.checkValidity()
  if(valid){
    let count=0
    for(let i=0;i<project.items.length;i++){
      if (project.items[i].title==title){
        count+=2
      }
    }
    //if count 0 then the name is not here and we can use this name
    if(count==0){
      available=true
   }
    //if count is not zero then the name has been used
    else{
     available=false
   }
  }
  //if the name is not valid then it is empty
 else{
    available='empty'
 }
  return available
}
  
//add a new to do list item to the projects current to do list
function addNewItemtoProject(item,project){
  //validate item name using function 
  let validate=validateItemName(item.title,project)
  //if name is valid then add extra properties to the project
  if (validate){
    addProjectProps(project)
    project.addItem(item)
    // //update project in local storage
    //delete old project and update it with the new one
    localStorage.removeItem(`${project.title}`)
    localStorage.setItem(`${project.title}`,JSON.stringify(project))
    //update search obj
    projectSearchObj[project.title]=project
  }
}

//display all projects under projects tab
function displayProjectTitles(){
  //get projects ul from html
  let display = document.getElementById('projects')
  //reset display element
  display.innerHTML=''
  //for each project in projects do the following
  for (let i=0; i<projects.length;i++){
    //create object to append to display
    let projectTitle = document.createElement('li')
    //add onclick function that will display the to do list items for the clicked project
    projectTitle.onclick=function(){displayProjectItems(i)}
    //make innertext of project title = to index project title and the number of 
    //to do list items this project has
    projectTitle.innerText=i+projects[i].title+projects[i].items.length
    display.appendChild(projectTitle)
  }
}

function openCreateNewProject(projectIndex){
  let title= document.getElementById('projectname')
  //if a project index is sent here then we want to edit a current project
  if(projectIndex!=undefined){
    title.value=projects[projectIndex].title
    //add projectIndex to close createNewProject function also
    projectSubmit.onclick=function(){closeCreateNewProject(projectIndex)}
  }
  //else add a new one
  else{
    title.value=''
  }
  //open form to submit new project
  projectForm.style.display='block'
}

function closeCreateNewProject(projectIndex){
  //get title of project
  let projectTitle= document.getElementById('projectname').value
  //call function to make sure project is not empty or already being used
  let validated= validateProjectName(projectTitle)
  //validate title name with switch statement
  switch(validated) {
    case 'empty':
      //if empty alert
      alert('The project needs to have a name before it can be input')
      openCreateNewProject()
      break;
    //name is already used
    case 'used':
      alert('There is already a project with this name.')
      openCreateNewProject()
      break;
    //if true then add book to collection
    case true:
      if(projectIndex==undefined){
        //close form and submit new project to project list
        let project = projectFactory(projectTitle)
        addNewProject(project)
        //reset title innertext
        projectTitle.value=''
        projectForm.style.display='none'
      }
      else{
        //
        let project = projects[projectIndex]
        localStorage.removeItem(project.title)
        project.title=projectTitle
        localStorage.setItem(project.title,JSON.stringify(project))
        //reset title innertext
        projectTitle.value=''
        projectForm.style.display='none'
      }
    //update display
    displayProjectTitles()
    displayProjectItems(projectIndex)
    }
}

function validateProjectName(title){
  //make sure it isn't empty
  if (title==''){
    return 'empty'
  }
  //else if to make sure no other project has this name
  //use search object that has names saved as key
   else if(projectSearchObj[title]!=undefined){
    return 'used'
   }
  //if it returns undefined then the name can be used
  else{
    return true
  }
}

//make header row function
function makeHeaderRow(itemsList){
  let headerRow= document.createElement('tr')
  let status = document.createElement('th')
  let title = document.createElement('th')   
  let priority = document.createElement('th')
  let duedate = document.createElement('th')
  let project=document.createElement('th')
  
  status.innerText='Status'
  //project.innerText='Project'
  title.innerText='Title'
  priority.innerText='Priority'
  duedate.innerText='Due date:'
  
  headerRow.appendChild(status)
  headerRow.appendChild(title)
  headerRow.appendChild(priority)
  headerRow.appendChild(duedate)
  //headerRow.appendChild(project)
  if (itemsList!=undefined){
    project.innerText='Project'
    headerRow.appendChild(project)
  }
  
  return headerRow
}

//function to delete project
function deleteProject(projectIndex){
  let project = projects[projectIndex]
  //
  //projects.splice(projectIndex,1)

  localStorage.removeItem(`${project.title}`)
  
  //get rid of project items display
  emptyProjectItemsDisplay()
  //projectTable.innerText=''
  retrieveData()
  displayProjectTitles()
  
  delete projectSearchObj[project.title]
}

//function to update project specifically the title
function updateProject(projectIndex,newTitle){
  let project = projects[projectIndex]
  addProjectProps(project)
  project.editTitle(newTitle)
  retrieveData()
  displayProjectTitles()
  displayProjectItems(projectIndex)
}

//after we delete a project there should 
function emptyProjectItemsDisplay(){
  projectTable.innerHTML=''
  projectTitle.innerHTML=''
  deleteButton.innerHTML=''
  editProjectButton.innerHTML=''
}

function displayProjectItems(projectIndex){
  toggleDisplay('projectitems')
  editProjectButton.innerHTML='<button>Edit Project</button>'
  editProjectButton.onclick=function(){projectFormPopUp(projectIndex)}
  deleteButton.innerHTML=`<button onclick='deleteProject(${projectIndex})'>Delete</button>`

  projectTitle.innerText=projects[projectIndex].title+projects[projectIndex].items.length

  projectTable.innerText=''
  let headerRow=makeHeaderRow()
  //add the item row to the items table for display
  projectTable.appendChild(headerRow)
  
  //line break
  let br = document.createElement("BR");

  //if there are no items
  
  //else there is
  ////for each project i want to display the items for this
  ////specific project=
   for (let i=0; i<projects[projectIndex].items.length;i++){
     let itemRow= document.createElement('tr')
     let status = document.createElement('td')
     let itemTitle = document.createElement('td')
     let priority = document.createElement('td')
     let duedate = document.createElement('td')

     status.innerText=projects[projectIndex].items[i].status
     itemTitle.innerText=projects[projectIndex].items[i].title
     priority.innerText=priorities[projects[projectIndex].items[i].priorityIndex]
     duedate.innerText= projects[projectIndex].items[i].duedate
     
    //create buttons to edit properties, project, status
    let editItemButton = document.createElement('td')
    editItemButton.innerHTML= `<button onclick='editItemFormPopUp(${projectIndex},${i})'>Edit</button>`

    //delete item button
    let deleteItem = document.createElement('td')
    deleteItem.innerHTML= `<button onclick='deleteItemFromProject(${projectIndex},${i})'>Delete</button>`
    //.deleteItem(${i})
    //add item properties to its respective row
    
    itemRow.appendChild(status)
    itemRow.appendChild(itemTitle)
    itemRow.appendChild(priority)
    itemRow.appendChild(duedate)
    itemRow.appendChild(editItemButton)
    itemRow.appendChild(deleteItem)
    itemRow.innerHTML+='<br>'
    
    projectTable.appendChild(itemRow)
    //add a new line for next line
    projectTable.appendChild(br);
   }
  //button to add a new to do list item to this current project
  let newItem = document.createElement('tr')
  newItem.innerHTML=`<button onclick='itemFormPopUp(${projectIndex})'>New To Do List Item</button>`
  projectTable.appendChild(newItem)
  
  //addtable to projectDisplay
  projectDisplay.appendChild(projectTable)
}

//delete an item from its project
function deleteItemFromProject(projectIndex,itemIndex){
  let project=projects[projectIndex]
  addProjectProps(project)
  project.deleteItem(itemIndex)
  displayProjectItems(projectIndex)
  displayProjectTitles()
}

function openCreateNewItem(projectIndex,itemIndex){
  if (itemIndex!=undefined){
    //get item elements
    let title= document.getElementById('new-to-do-list-item-title')
    let description= document.getElementById('item-description')
    let duedate= document.getElementById('duedate')
    let priorityIndex= document.getElementById('priority')
    //let projectDropDown= document.getElementById('item-project-dropdown')
    //let status= document.getElementById('new-to-do-list-item-title')
    
    //get current values
    let currentTitle = projects[projectIndex].items[itemIndex].title
    let currentDescription = projects[projectIndex].items[itemIndex].description
    let currentProjectIndex = projects[projectIndex].items[itemIndex].projectIndex
    let currentDate = projects[projectIndex].items[itemIndex].date
    let currentPriority = projects[projectIndex].items[itemIndex].priority

    // //set placeholders
    title.value=currentTitle;
    description.value=currentDescription
    duedate.value=currentDate
    priorityIndex.placeholder=currentPriority
    projectIndex.value=currentProjectIndex

    //change onclick to include this item and index index
    let itemSubmission = document.getElementById('item-submit')
    itemSubmission.onclick=function(){closeNewItemForm(projectIndex,itemIndex)}
  }
  //set due date min to today
  
  duedate.min=new Date().toLocaleDateString()
  let placeholder =document.getElementById('item-project-dropdown')
  placeholder=makeProjectDropDown(projectIndex)
}

function closeNewItemForm(projectIndex,itemIndex){
  let itemTitle =document.getElementById('new-to-do-list-item-title').value
  let project = projects[projectIndex]
  //project dropdown
  let index=document.getElementById('item-project-dropdown').value
  let duedate = document.getElementById('duedate').value
  let description = document.getElementById('item-description').value
  let priorityIndex = document.getElementById('priority').value

  //dont check name if the item is being edited
  if(projectIndex!=undefined &&itemIndex!=undefined){
    let updatedItem = itemFactory(itemTitle,description,index,priorityIndex,duedate)
    project.items[itemIndex]=updatedItem
    addProjectProps(project)
    //save the project
    project.save()
  }
  //if new item check name
  else{
    let result = validateItemName(itemTitle,projects[index])
    if(result==true){
      //if it is true then we want to create a new item within this project
      //make instance of item and give it its attributes 
      let item = itemFactory(itemTitle,description,index,priorityIndex,duedate)
      addNewItemtoProject(item,projects[index])
    }
    else if(result=='empty'){
        alert('Make sure the to do list item has a name/')
    }
    else{
      alert('This project already has a to do list item with that name. Please try using a different name.')
    }
  itemForm.style.display='none'
  itemForm.value=''
  //display all projects
  displayProjectTitles()
  }
}

function makeProjectDropDown(projectIndex){
  //get project element
  let dropDown=document.getElementById('item-project-dropdown')
  dropDown.innerHTML=''
  for (let i=0;i<projects.length;i++){
    //display the title name and save the index if this is the assumed project
    if(projectIndex==i){
      dropDown.innerHTML+=`<option value='${i}' selected="selected">${projects[i].title}</option>`
    }
    else {
      dropDown.innerHTML+=`<option value='${i}'>${projects[i].title}</option>`
    }
  }
 return dropDown
}

//form popup function for new projects
function projectFormPopUp(projectIndex){
  if(projectIndex==undefined){
    openCreateNewProject()
  }
  else{
    openCreateNewProject(projectIndex)
  }
  
  //blur body as well
  main.style.filter ='blur(6px)';
  projectForm.style.display='block'
}

//form popup function
function itemFormPopUp(projectIndex){
  openCreateNewItem(projectIndex)
  //blur main as well
  main.style.filter ='blur(6px)';
  itemForm.style.display='block'
}

function editItemFormPopUp(projectIndex,itemIndex){
  openCreateNewItem(projectIndex,itemIndex)
  //blur main as well
  main.style.filter ='blur(6px)';
  itemForm.style.display='block'
}

//get a list of all 
function getListOfAllItems(){
  itemsList=[]
  for (let i=0; i<projects.length;i++){
    for(let j=0;j<projects[i].items.length;j++){
      itemsList.push(projects[i].items[j])
    }
  }
  return itemsList
}

//toggle display function so only certain portions of the page are displayed at once
function toggleDisplay(section){
  let projectDisplay= document.getElementById('project-display')
  let itemsDisplay= document.getElementById('item-display')
  
  //if section = items//
  if(section=='allitems'){
    projectDisplay.style.display='none'
    itemsDisplay.style.display='block'
  }
  //section for projects display
  if(section=='projectitems'){
    projectDisplay.style.display='block'
    itemsDisplay.style.display='none'
  }
}

//display items list
function displayItemsList(list){
  //add button to sort the given list by date
  let sortByDateButton = document.getElementById('date-sort')
  sortByDateButton.onclick=function(){displayListSortedByDate(list)}
  //button to sort by priority
  let sortByPriorityButton=document.getElementById('priority-sort')
  sortByPriorityButton.onclick=function(){displayListSortedByPriority(list)}

  let headerRow=makeHeaderRow('showprojects')
  let br = document.createElement("BR");
  let itemsDisplayTable= document.getElementById('items-display-table')
  itemsDisplayTable.innerHTML=''
  itemsDisplayTable.appendChild(headerRow)
  for (let i=0;i<list.length;i++){
    let itemRow= document.createElement('tr')
    let status = document.createElement('td')
    let itemTitle = document.createElement('td')
    let priority = document.createElement('td')
    let duedate = document.createElement('td')
    let projectTitle = document.createElement('td')

    status.innerText=list[i].status
    itemTitle.innerText=list[i].title
    priority.innerText=priorities[list[i].priorityIndex]
    duedate.innerText= list[i].duedate
    projectTitle.innerText=projects[list[i].projectIndex].title
    
    itemRow.appendChild(status)
    itemRow.appendChild(itemTitle)
    itemRow.appendChild(priority)
    itemRow.appendChild(duedate)
    itemRow.appendChild(projectTitle)
    itemRow.innerHTML+='<br>'
    
    itemsDisplayTable.appendChild(itemRow)
    //add a new line for next line
    itemsDisplayTable.appendChild(br);
   }
}

function displayAllItems(){
  let itemsList = getListOfAllItems()
  //toggle on items-dsiplay and turn off everything else
  toggleDisplay('allitems')
  //add buttons to items display to sort list

  displayItemsList(itemsList)
}

//sort list by date
function sortListByDate(list){
  list =list.sort(function compare(a, b) {
    var dateA = new Date(a.duedate);
    var dateB = new Date(b.duedate);
    return dateA - dateB;
  })
  return list
}

function displayListSortedByDate(list){
  list = sortListByDate(list)
  displayItemsList(list)
}


function displayListSortedByPriority(list){
  list = sortListByPriority(list)
  displayItemsList(list)
}

//sort given list by priority
function sortListByPriority(list){
  list.sort((a, b) => {
    if (a.priorityIndex > b.priorityIndex) {
      return -1;
    }
    if (a.priorityIndex < b.priorityIndex) {
      return 1;
    }
    return 0;
  });
  return list
}

retrieveData()
displayProjectTitles()
displayAllItems(itemsList)
//next steps
//all items page buttons to sort list by date priority or both
//fix create new project for when i want to reenter the same name for the proejct being edited
//add a sort button for each project page
//css and visual
//when i click off of a form I want to close it and unblur background
//when editing item the date is not already stored
//edit button on all items page

//delete button on all items page
//change priority onclick in all pages
//authorization?

