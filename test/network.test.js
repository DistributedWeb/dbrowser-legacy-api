const test = require('ava')
const ddrive = require('ddrive')
const tutil = require('./util')
const dba = require('../index')

function isDownloaded (st) {
  return st.blocks === st.downloaded
}

async function contentEvent (archive) {
  return new Promise(resolve => {
    archive.on('content', resolve)
  })
}

test('download individual files', async t => {
  const src = await tutil.createArchive([
    'foo.txt',
    { name: 'bar.data', content: Buffer.from([0x00, 0x01]) },
    'subdir/',
    'subdir/foo.txt',
    { name: 'subdir/bar.data', content: Buffer.from([0x00, 0x01]) }
  ])
  const dst = ddrive(tutil.tmpdir(), src.key, {sparse: true})
  const srcRS = src.replicate({live: true})
  const dstRS = dst.replicate({live: true})
  srcRS.pipe(dstRS).pipe(srcRS)
  await contentEvent(dst)

  await dba.download(dst, '/foo.txt')
  await dba.download(dst, 'bar.data')
  await dba.download(dst, '/subdir/foo.txt')
  await dba.download(dst, 'subdir/bar.data')
  t.deepEqual(isDownloaded(await dba.stat(dst, '/foo.txt')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/bar.data')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/foo.txt')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/bar.data')), true)
})

test('download a subdirectory', async t => {
  const src = await tutil.createArchive([
    { name: 'foo.txt', content: 'This is the first file' },
    { name: 'bar.data', content: 'How about another' },
    'subdir/',
    { name: 'subdir/foo.txt', content: 'Sub dir item here' },
    { name: 'subdir/bar.data', content: 'And the last one' }
  ])
  const dst = ddrive(tutil.tmpdir(), src.key, {sparse: true})
  const srcRS = src.replicate({live: true})
  const dstRS = dst.replicate({live: true})
  srcRS.pipe(dstRS).pipe(srcRS)
  await contentEvent(dst)

  await dba.download(dst, '/subdir')
  t.deepEqual(isDownloaded(await dba.stat(dst, '/foo.txt')), false)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/bar.data')), false)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/foo.txt')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/bar.data')), true)
})

test('download a full archive', async t => {
  const src = await tutil.createArchive([
    'foo.txt',
    { name: 'bar.data', content: Buffer.from([0x00, 0x01]) },
    'subdir/',
    'subdir/foo.txt',
    { name: 'subdir/bar.data', content: Buffer.from([0x00, 0x01]) }
  ])
  const dst = ddrive(tutil.tmpdir(), src.key, {sparse: true})
  const srcRS = src.replicate({live: true})
  const dstRS = dst.replicate({live: true})
  srcRS.pipe(dstRS).pipe(srcRS)
  await contentEvent(dst)

  await dba.download(dst, '/')
  t.deepEqual(isDownloaded(await dba.stat(dst, '/foo.txt')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/bar.data')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/foo.txt')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/bar.data')), true)
})

test('download an already-downloaed archive', async t => {
  const src = await tutil.createArchive([
    'foo.txt',
    { name: 'bar.data', content: Buffer.from([0x00, 0x01]) },
    'subdir/',
    'subdir/foo.txt',
    { name: 'subdir/bar.data', content: Buffer.from([0x00, 0x01]) }
  ])
  const dst = ddrive(tutil.tmpdir(), src.key, {sparse: true})
  const srcRS = src.replicate({live: true})
  const dstRS = dst.replicate({live: true})
  srcRS.pipe(dstRS).pipe(srcRS)
  await contentEvent(dst)

  await dba.download(dst, '/')
  t.deepEqual(isDownloaded(await dba.stat(dst, '/foo.txt')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/bar.data')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/foo.txt')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/bar.data')), true)
  
  await dba.download(dst, '/')
  t.deepEqual(isDownloaded(await dba.stat(dst, '/foo.txt')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/bar.data')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/foo.txt')), true)
  t.deepEqual(isDownloaded(await dba.stat(dst, '/subdir/bar.data')), true)
})
