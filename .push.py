#!/usr/local/bin/python3

import sys
import os
import http.client
from urllib.parse import quote
import json

if len(sys.argv) < 3:
	print('Usage: .push.py username password [summary]')
	sys.exit(1)
elif len(sys.argv) < 4:
	sys.argv.append('') #fun

print('Collecting files...')
files = {}
dirs = [os.listdir()]
dirnames = ['']
while len(dirs):
	dir = dirs[0]
	dirname = dirnames[0]
	if len(dirname): dirname += '/'
	dirs = dirs[1:]
	dirnames = dirnames[1:]
	for file in dir:
		if file.endswith('.js') or file.endswith('.css'):
			with open(dirname + file) as f: files['MediaWiki:B3.js/' + dirname + file] = f.read()
			print('\t' + dirname + file + ': ' + str(len(files['MediaWiki:B3.js/' + dirname + file])))
		elif file[0] != '.':
			dirs.append(os.listdir(dirname + file))
			dirnames.append(dirname + file)

print('Connecting...')
sock = http.client.HTTPConnection('monchbox.wikia.com', timeout=30)

print('Logging in as ' + sys.argv[1] + '...')
user = quote(sys.argv[1])
password = quote(sys.argv[2])
sock.request(
	'POST',
	'/api.php',
	'action=login&lgname=' + user + '&lgpassword=' + password + '&format=json',
	{'Connection': 'Keep alive', 'Content-Type': 'application/x-www-form-urlencoded'}
)
response = sock.getresponse()
session = response.getheader('Set-Cookie')
session = session[:session.find(';') + 1]
token = quote(json.loads(response.read().decode('utf-8'))['login']['token'])
sock.request(
	'POST',
	'/api.php',
	'action=login&lgname=' + user +'&lgpassword=' + password + '&lgtoken=' + token + '&format=json',
	{'Connection': 'Keep alive', 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': session}
)
sock.getresponse()

print('Fetching tokens...')
sock.request(
	'GET',
	'/api.php?action=query&prop=info&titles=' + '|'.join(list(files.keys())) + '&intoken=edit&format=json',
	'',
	{'Connection': 'Keep alive', 'Cookie': session}
)
pages = json.loads(sock.getresponse().read().decode('utf-8'))['query']['pages']

for page in pages:
	print('Publishing: ' + pages[page]['title'] + ' ...')
	sock.request(
		'POST',
		'/api.php',
		'action=edit&title=' + pages[page]['title'] + '&text=' + files[pages[page]['title']] + '&reason=' + quote(sys.argv[3]) + '&token=' + quote(pages[page]['edittoken']),
		{'Connection': 'Keep alive', 'Cookie': session}
	)
	sock.getresponse()

print('Logging out...')
sock.request('GET', '/api.php?action=logout', '', {'Cookie': session})
sock.close()
