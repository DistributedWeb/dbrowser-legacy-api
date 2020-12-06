const test = require('ava')
const tutil = require('./util')
const dba = require('../index')

test('findEntryByContentBlock', async t => {
  var st
  var archive = await tutil.createArchive([
    {name: 'a', content: 'a'},
    'b/',
    {name: 'b/a', content: 'b/a'},
    'b/b/',
    {name: 'b/b/a', content: 'b/b/a'},
    {name: 'b/b/b', content: 'b/b/b'},
    {name: 'b/b/c', content: 'b/b/c'},
    {name: 'b/c', content :'b/c'},
    'c/',
    {name: 'd', content :'d'}
  ])
  await new Promise(resolve => archive.ready(resolve))

  st = await dba.stat(archive, '/a')
  t.deepEqual((await dba.findEntryByContentBlock(archive, st.offset)).name, '/a')
  st = await dba.stat(archive, '/b/a')
  t.deepEqual((await dba.findEntryByContentBlock(archive, st.offset)).name, '/b/a')
  st = await dba.stat(archive, '/b/b/a')
  t.deepEqual((await dba.findEntryByContentBlock(archive, st.offset)).name, '/b/b/a')
  st = await dba.stat(archive, '/b/b/b')
  t.deepEqual((await dba.findEntryByContentBlock(archive, st.offset)).name, '/b/b/b')
  st = await dba.stat(archive, '/b/b/c')
  t.deepEqual((await dba.findEntryByContentBlock(archive, st.offset)).name, '/b/b/c')
  st = await dba.stat(archive, '/b/c')
  t.deepEqual((await dba.findEntryByContentBlock(archive, st.offset)).name, '/b/c')
  st = await dba.stat(archive, '/d')
  t.deepEqual((await dba.findEntryByContentBlock(archive, st.offset)).name, '/d')
})
