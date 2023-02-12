import { HttpHeaders } from '@angular/common/http';
import { ProgrammingLanguage } from '@git-gud/entities';

export const API_URL = 'http://localhost:3333/api';
export const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

export const CODEMIRROR_THEME = 'night';

export const TAGS = [
  { name: 'Array', value: 'Array' },
  { name: 'String', value: 'String' },
  { name: 'Hash Table', value: 'Hash Table' },
  { name: 'Dynamic Programming', value: 'Dynamic Programming' },
  { name: 'Math', value: 'Math' },
  { name: 'Sorting', value: 'Sorting' },
  { name: 'Greedy', value: 'Greedy' },
  { name: 'Graph Search', value: 'Graph Search' },
  { name: 'Binary Search', value: 'Binary Search' },
  { name: 'Tree', value: 'Tree' },
  { name: 'Martix', value: 'Matrix' },
  { name: 'Stack', value: 'Stack' },
];

export const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  {
    id: 50,
    name: 'C',
    codeTemplate: `
#include <stdio.h>
#include <limits.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
  char text[64];
  scanf("%s", text);


  printf("%s", text);
  return 0;
}`,
    codemirrorMode: 'text/x-csrc',
  },
  {
    id: 51,
    name: 'C#',
    codeTemplate: `
using System;
public class Program
{
  public static void Main(string[] args)
  {
    string s = Console.ReadLine();
    Console.WriteLine(s);
  }
}`,
    codemirrorMode: 'text/x-csharp',
  },
  {
    id: 54,
    name: 'C++',
    codeTemplate: `
#include <iostream>
#include <string>

int main()
{
  std::string text;
  std::cin >> text;

  std::cout << text;

  return 0;
}`,
    codemirrorMode: 'text/x-c++src',
  },
  {
    id: 62,
    name: 'Java',
    codeTemplate: `
import java.util.Scanner;

class Main {
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    String s = scanner.nextLine();
    
    System.out.println(s);
  }
}`,
    codemirrorMode: 'text/x-java',
  },
  {
    id: 63,
    name: 'JavaScript (node)',
    codeTemplate: `
const fs = require('fs');
const text = fs.readFileSync(0, 'utf-8');

console.log(text);  
`,
    codemirrorMode: 'text/javascript',
  },
  {
    id: 71,
    name: "Python",
    codeTemplate: `
text = input()



print(text)
    `,
    codemirrorMode: 'text/x-python'
  }
];
