export const alertErrors = (err: any) => {
  console.log(err);
  for (const error of Object.values(err.error.errors)) {
    alert('Error: ' + error);
  }
};
