  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-analytics.js";

  import {
    getFirestore, 
    collection, 
    addDoc,
    getDocs,
    deleteDoc,
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    query,
    where
  } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js"



  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBv2Hy1x7AmqR0mq4PLZNR-K-2zbqpK8P0",
    authDomain: "fir-javascrip-crud-417b7.firebaseapp.com",
    projectId: "fir-javascrip-crud-417b7",
    storageBucket: "fir-javascrip-crud-417b7.appspot.com",
    messagingSenderId: "663562046433",
    appId: "1:663562046433:web:3e10cd8e887776304220a0",
    measurementId: "G-9QB50JJH5S"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  const db = getFirestore()


  export const saveTask = (name, description,stock, precio) => {
    addDoc(collection(db, 'tasks'),{name: name, description: description,stock: stock, precio: precio})
  };
  export const getTasks = () => getDocs(collection(db, 'tasks'));

  export const onGetTasks = (callback) => onSnapshot(collection(db, 'tasks'), callback);

  export const deleteTask = (id) => deleteDoc(doc(db, 'tasks', id));

  export const getTask = (id) => getDoc(doc(db, 'tasks', id));

  export const updateTask = (id, newFields) => updateDoc(doc(db, 'tasks', id), newFields);


//colección carrito
export const saveShoppingCar=(cantidad,id_product)=>{
  addDoc(collection(db,"shoppingcar"),{cantidad,id_product})
}

export const deleteShoppingCar=(id)=>deleteDoc(doc(db,"shoppingcar",id))

export const onGetShoppingCar=(callback)=>onSnapshot(collection(db,"shoppingcar"),callback)

//colleccion ventas
export const saveSale=(products,fecha,total)=>{
  addDoc(collection(db,"sale"),{
    products,
    fecha,
    total
  })
}

export const onGetSale=(callback)=>onSnapshot(collection(db,"sale"),callback)


//colecion user
export const getUser= (id)=>getDoc(doc(db,"user",id));

export const saveUser=async (name,lastname,email,password,role,address)=>{
    return addDoc(collection(db,"user"),{
      name,
      lastname,
      email,
      password,
      role,
      address
    });
}

export const updateUser=(id,name,lastname,email,role,address,password)=>{
  let data=(typeof(password)!=="undefined")?{
    name,
    lastname,
    email,
    role,
    address,
    password
  }:{
    name,
    lastname,
    email,
    role,
    address,
  };

  return updateDoc(doc(db,"user",id),data);
}

export const getByEmail=(email)=>{
  const consult_query = query(collection(db,"user"),where("email","==",email));

  return getDocs(consult_query);
}

export const onGetUsers=(callback)=>onSnapshot(collection(db,"user"),callback);
export const deleteUser=(id)=>deleteDoc(doc(db,"user",id));