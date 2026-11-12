import axios from 'axios';
export async function aiPost(path, body){ try { return (await axios.post(`${process.env.AI_SERVICE_URL}${path}`,body,{timeout:8000})).data; } catch { return null; } }
