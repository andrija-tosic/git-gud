export type Judge0SubmissionResponse = {
  stdout?: string;
  time: string;
  memory: number;
  stderr?: string;
  token: string;
  compile_output?: string;
  message?: string;
  status: {
    id: number;
    description: string;
  };
};
