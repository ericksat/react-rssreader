const args = ['start'];
const opts = { stdio: 'inherit', cwd: '../client', shell: true };
let c = require('child_process');
try {
    c.spawn('npm.cmd', args, opts);
} catch (e) {
    console.log(e.message);
    console.log(e);
}