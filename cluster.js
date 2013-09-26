var cluster = require('cluster');
//获取cpu的数量
var numCPUs = require('os').cpus().length;

var workers = {};
if (cluster.isMaster) {
  // 主进程分支
  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
    //当一个工作进程结束时,重启工作进程 delete workers[worker.pid];
    worker = cluster.fork();
    workers[worker.pid] = worker;
  });
  // 初始开启与CPU 数量相同的工作进程 
  for (var i = 0; i < numCPUs; i++) {
    var worker = cluster.fork();
    workers[worker.pid] = worker;
  }
} else {
  // 工作进程分支,启动服务器
  var app = require('./app');
  app.start();
}
// 当主进程被终止时,关闭所有工作进程
process.on('SIGTERM', function() {
  for (var pid in workers) {
    process.kill(pid);
  }
  process.exit(0);
});