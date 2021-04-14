// import uuid from 'uuid';

const getDeviceID = () => {
  const key = 'peer-device-id';
  let id = localStorage.getItem(key);
  
  if(id && !uuid.validate(id)) {
    id = '';
  }
  
  if(!id) {
    id = uuid.v4();
    localStorage.setItem(key, id);
  }

  return id;
}