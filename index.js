let fs = require('fs')
let http = require('http')
let httpProxy = require('http-proxy')
let proxy = httpProxy.createProxyServer({})

let proxies = {}

const read = (file) => {
    let lines = []
    if (fs.existsSync(file)) {
        fs.readFileSync(file, 'ascii').split('\n').forEach(line => {
            if (line !== '') lines.push(line)
        })
    }
    return lines
}

let rootDomains = read('.domains')

fs.readdirSync('www').forEach((sub) => {
    let port = read('www/' + sub + '/.port')[0]
    proxies[sub] = 'http://localhost:' + port
    rootDomains.forEach((rootDomain) => {
        proxies[sub + '.' + rootDomain] = proxies[sub]
    })
})

console.log(proxies)

http.createServer((req, res) => {
    let hostname = req.headers.host.split(':')[0]
    console.log('Proxying: ' + hostname)
    let target = proxies[hostname]
    if (target) {
        proxy.web(req, res, { target })
    } else {
        res.end('Unknown hostname')
    }
}).listen(80)
