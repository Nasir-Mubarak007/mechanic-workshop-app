import axios from "axios";

export const fetchJobs = async () => {
  return axios.get("/api/jobs");  // returns all jobs
};

export const fetchServices = async () => {
  return axios.get("/api/services");
};

export const fetchTodaysJobs = async () => {
  return axios.get("/api/jobs?date=today"); 
  // if not available, just fetchJobs and filter in frontend
};
