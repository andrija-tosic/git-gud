export type Judge0SubmissionRequest = {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output: string;
  number_of_runs?: number;
  cpu_time_limit?: number;
  cpu_extra_time?: number;
  wall_time_limit?: number;
  memory_limit?: number;
  stack_limit?: number;
  max_processes_and_or_threads?: number;
  enable_per_process_and_thread_time_limit?: boolean;
  enable_per_process_and_thread_memory_limit?: boolean;
  max_file_size?: number;
  enable_network?: boolean;
};

// export interface Judge0SubmissionRequestBase64
//   extends Omit<Judge0SubmissionRequest, 'source_code' | 'stdin' | 'expected_output'> {
//   source_code: Buffer;
//   stdin: Buffer;
//   expected_output: Buffer;
// }
