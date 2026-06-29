const fs = require('fs');
const path = require('path');

function replaceAlerts(content) {
  let modified = false;

  // Add import if needed
  if ((content.includes('alert(') || content.includes('confirm(') || content.includes('window.confirm(') || content.includes('window.alert(')) && !content.includes('useModalStore')) {
    // Find last import
    const lastImportIndex = content.lastIndexOf('import ');
    const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;
    
    // figure out path to store
    // we assume it's run on src/pages/Admin.jsx so '../store/modalStore'
    const importStr = "import { useModalStore } from '../store/modalStore';\n";
    content = content.slice(0, nextLineIndex) + importStr + content.slice(nextLineIndex);
    modified = true;
  }

  // Replace confirm (assume they are in async functions)
  if (content.includes('confirm(')) {
    content = content.replace(/(!)?(?:window\.)?confirm\(`([^`]+)`\)/g, "$1(await useModalStore.getState().confirm('Confirmation', `$2`))");
    content = content.replace(/(!)?(?:window\.)?confirm\('([^']+)'\)/g, "$1(await useModalStore.getState().confirm('Confirmation', '$2'))");
    content = content.replace(/(!)?(?:window\.)?confirm\("([^"]+)"\)/g, "$1(await useModalStore.getState().confirm('Confirmation', \"$2\"))");
    modified = true;
  }

  // Replace alert
  if (content.includes('alert(')) {
    content = content.replace(/(?:window\.)?alert\(`([^`]+)`\)/g, (match, msg) => {
      const isError = msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error');
      const type = isError ? 'error' : 'info';
      const title = isError ? 'Error' : 'Information';
      return `useModalStore.getState().${type}('${title}', \`${msg}\`)`;
    });
    
    content = content.replace(/(?:window\.)?alert\('([^']+)'\)/g, (match, msg) => {
      const isError = msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error');
      const type = isError ? 'error' : 'info';
      const title = isError ? 'Error' : 'Information';
      return `useModalStore.getState().${type}('${title}', '${msg}')`;
    });
    
    content = content.replace(/(?:window\.)?alert\("([^"]+)"\)/g, (match, msg) => {
      const isError = msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error');
      const type = isError ? 'error' : 'info';
      const title = isError ? 'Error' : 'Information';
      return `useModalStore.getState().${type}('${title}', "${msg}")`;
    });
    
    // Also catch alert(variable)
    content = content.replace(/(?:window\.)?alert\(([^)'"`]+)\)/g, (match, variable) => {
      return `useModalStore.getState().info('Information', ${variable})`;
    });

    modified = true;
  }

  return { content, modified };
}

const file = 'e:/AntiGravity/Swastika_Sarees_Git/src/pages/Admin.jsx';
let content = fs.readFileSync(file, 'utf-8');
const result = replaceAlerts(content);
if (result.modified) {
  fs.writeFileSync(file, result.content, 'utf-8');
  console.log(`Updated ${file}`);
} else {
  console.log(`No changes needed for ${file}`);
}
