var path, node_ssh, ssh, fs
 
fs = require('fs')
path = require('path')
node_ssh = require('node-ssh')
ssh = new node_ssh()
/* 
ssh.connect({
  host: 'localhost',
  username: 'steel',
  privateKey: '/home/steel/.ssh/id_rsa'
})*/

console.log(fs.readFileSync('/home/.ssh/id_rsa'));
 
 /*ssh.connect({
   host: 'zqa-231.eng.zimbra.com',
   username: 'root',
   privateKey: '..\\..\\.ssh\\id_rsa'
 })

.then(function() {
  // Local, Remote
  
    ssh.execCommand(`sudo su - zimbra -c 'zmcontrol -v'`, { cwd:'/var/www' }).then(function(result) {
    console.log('STDOUT: ' + result.stdout)
    console.log('STDERR: ' + result.stderr)
	process.exit();
  })
 
  
});*/
