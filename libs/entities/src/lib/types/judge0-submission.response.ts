export interface Judge0SubmissionResponse {
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
}

// export interface Judge0SubmissionResponseBase64 extends Omit<Judge0SubmissionResponse, 'stdout'> {
//   stdout: Buffer;
// }
