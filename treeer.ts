import fs from "node:fs";
import path from "node:path";


interface TreeNode {
  name: string;
  isFile: boolean;
  children: TreeNode[];
}



const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".nuxt",
  ".output",
  "dist",
  "build",
  "coverage",
  ".cache",
]);



const IMPORTANT_FILES = new Set([
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",

  "nuxt.config.ts",
  "vite.config.ts",
  "tsconfig.json",

  "Dockerfile",
  "docker-compose.yml",

  "composer.json",
  "requirements.txt",
  "go.mod",
  "Cargo.toml",

  ".env.example",

  "README.md",
  "README",
]);



const KEEP_PATTERN =
  /^(index|app|main|router|layout|middleware)\./i;



const ASSET_EXTENSIONS =
  new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".ico",
    ".mp4",
    ".mp3",
  ]);




function isFile(name:string) {
  return path.extname(name).length > 0;
}



function getExtension(
  name:string
):string | null {

  const ext =
    path.extname(name);

  return ext
    ? ext.slice(1)
    : null;
}



function isImportantFile(
  name:string
) {

  return (
    IMPORTANT_FILES.has(name) ||
    KEEP_PATTERN.test(name)
  );
}





function scanFileSystem(
  target:string
):TreeNode {


  const stat =
    fs.statSync(target);


  const name =
    path.basename(target);



  if (stat.isFile()) {

    return {
      name,
      isFile:true,
      children:[],
    };
  }



  const node:TreeNode = {
    name,
    isFile:false,
    children:[],
  };



  const entries =
    fs.readdirSync(
      target,
      {
        withFileTypes:true,
      }
    );



  for (const entry of entries) {


    if (
      entry.isDirectory() &&
      IGNORE_DIRS.has(entry.name)
    ) {
      continue;
    }



    node.children.push(
      scanFileSystem(
        path.join(
          target,
          entry.name
        )
      )
    );
  }



  return node;
}







function parseTree(
  lines:string[]
):TreeNode {


  const root:TreeNode = {
    name:".",
    isFile:false,
    children:[],
  };



  const stack:{
    depth:number;
    node:TreeNode;
  }[] = [
    {
      depth:-1,
      node:root,
    }
  ];



  for (const line of lines) {


    const match =
      line.match(
        /^([│\s]*)(├── |└── )(.+)$/
      );


    if (!match) {
      continue;
    }



    const prefix =
      match[1];


    const name =
      match[3].trim();



    const depth =
      Math.floor(
        prefix
          .replaceAll("│"," ")
          .length / 4
      ) + 1;



    const node:TreeNode = {
      name,
      isFile:isFile(name),
      children:[],
    };



    while (
      stack.length &&
      stack.at(-1)!.depth >= depth
    ) {
      stack.pop();
    }



    const parent =
      stack.at(-1)?.node;



    if (!parent) {
      continue;
    }



    parent.children.push(node);



    stack.push({
      depth,
      node,
    });
  }



  return root;
}







function applyFocus(
  root:TreeNode,
  focus?:string
) {

  if (!focus) {
    return root;
  }



  let current =
    root;



  for (
    const part of focus.split("/")
  ) {

    const next =
      current.children.find(
        x => x.name === part
      );


    if (!next) {
      return root;
    }


    current = next;
  }



  return current;
}







function transform(
  node:TreeNode,
  root = true
) {


  if (node.isFile) {
    return;
  }



  const remove =
    new Set<TreeNode>();


  const groups =
    new Map<string,TreeNode[]>();


  const assets =
    new Map<string,number>();



  for (const child of node.children) {


    if (!child.isFile) {
      continue;
    }



    if (root) {
      continue;
    }



    if (
      isImportantFile(child.name)
    ) {
      continue;
    }



    const ext =
      path.extname(child.name);



    if (
      ASSET_EXTENSIONS.has(ext)
    ) {

      assets.set(
        ext,
        (assets.get(ext) ?? 0) + 1
      );

      remove.add(child);
      continue;
    }



    const type =
      getExtension(child.name);



    if (!type) {
      continue;
    }



    if (!groups.has(type)) {
      groups.set(type,[]);
    }



    groups.get(type)!.push(child);
  }






  for (
    const [ext,files]
    of groups
  ) {


    files.forEach(
      f => remove.add(f)
    );


    node.children.push({
      name:
        `*.${ext} (${files.length} files)`,
      isFile:true,
      children:[],
    });
  }




  for (
    const [ext,count]
    of assets
  ) {

    node.children.push({
      name:
        `*${ext} (${count} files)`,
      isFile:true,
      children:[],
    });
  }




  node.children =
    node.children.filter(
      x => !remove.has(x)
    );



  node.children.sort(
    (a,b)=>{

      if (a.isFile !== b.isFile) {
        return a.isFile ? 1 : -1;
      }


      return a.name.localeCompare(
        b.name
      );
    }
  );



  node.children.forEach(
    child =>
      transform(child,false)
  );
}








function printTree(
  node:TreeNode,
  prefix="",
  last=true,
  root=true
):string[] {


  const result:string[] = [];



  if (!root) {

    result.push(
      `${prefix}${last?"└── ":"├── "}${node.name}`
    );


    prefix +=
      last
      ? "    "
      : "│   ";
  }



  node.children.forEach(
    (child,index)=>{

      result.push(
        ...printTree(
          child,
          prefix,
          index === node.children.length - 1,
          false
        )
      );
    }
  );



  return result;
}







function estimateTokens(
  text:string
) {

  return Math.round(
    text.length / 4
  );
}






// ----------------------
// CLI
// ----------------------


const args =
  process.argv.slice(2);


const input =
  args[0];


const output =
  args[1];



const focusIndex =
  args.indexOf("--focus");


const focus =
  focusIndex !== -1
    ? args[focusIndex + 1]
    : undefined;



if (!input) {

  console.error(
    "Usage: tsx tree-ai.ts <file|directory|tree.txt> [output.txt] [--focus path]"
  );

  process.exit(1);
}




let tree:TreeNode;



const stat =
  fs.statSync(input);



if (stat.isDirectory()) {

  tree =
    scanFileSystem(input);

} else {

  const content =
    fs.readFileSync(
      input,
      "utf8"
    );


  if (
    content.includes("├──") ||
    content.includes("└──")
  ) {

    tree =
      parseTree(
        content.split(/\r?\n/)
      );

  } else {

    tree = {
      name:path.basename(input),
      isFile:true,
      children:[],
    };
  }
}



tree =
  applyFocus(
    tree,
    focus
  );



transform(tree);



const lines =
  printTree(tree);



const stats =
`
AI Stats:
Lines: ${lines.length}
Estimated tokens: ${estimateTokens(lines.join("\n"))}
`;



const result =
[
  ...lines,
  stats,
].join("\n");





if (output) {

  fs.writeFileSync(
    output,
    result,
    "utf8"
  );


  console.log(
    `Saved: ${output}`
  );

} else {

  console.log(result);
}