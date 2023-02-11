export const alertErrors = (err: { error: { errors: { [s: string]: unknown; } | ArrayLike<unknown>; }; }) => {
  console.log(err);
  for (const error of Object.values(err.error.errors)) {
    alert('Error: ' + error);
  }
};
