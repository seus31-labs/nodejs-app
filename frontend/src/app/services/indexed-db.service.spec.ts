import { TestBed } from '@angular/core/testing'
import { IndexedDbService } from './indexed-db.service'

const TEST_DB = `test-indexeddb-${Date.now()}`

describe('IndexedDbService (20.3)', () => {
  let service: IndexedDbService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(IndexedDbService)
  })

  afterEach(async () => {
    service.close()
    if (typeof indexedDB !== 'undefined') {
      await new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase(TEST_DB)
        req.onsuccess = () => resolve()
        req.onerror = () => resolve()
      })
    }
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should open DB and create store from schema', async () => {
    await expectAsync(
      service.open(TEST_DB, 1, [
        { name: 'items', keyPath: 'id', indexes: [{ name: 'byId', keyPath: 'id', unique: true }] }
      ])
    ).toBeResolved()
  })

  it('should put and get value', async () => {
    await service.open(TEST_DB, 2, [{ name: 'store1', keyPath: 'id' }])
    await service.put('store1', { id: 'a', value: 1 })
    const got = await service.get<{ id: string; value: number }>('store1', 'a')
    expect(got).toEqual({ id: 'a', value: 1 })
  })

  it('should getAll and delete and clear', async () => {
    await service.open(TEST_DB, 3, [{ name: 'store2', keyPath: 'id' }])
    await service.put('store2', { id: 'x', v: 1 })
    await service.put('store2', { id: 'y', v: 2 })
    let all = await service.getAll<{ id: string; v: number }>('store2')
    expect(all.length).toBe(2)
    await service.delete('store2', 'x')
    all = await service.getAll<{ id: string; v: number }>('store2')
    expect(all.length).toBe(1)
    expect(all[0].id).toBe('y')
    await service.clear('store2')
    all = await service.getAll('store2')
    expect(all.length).toBe(0)
  })

  it('should throw if get before open', async () => {
    await expectAsync(service.get('any', 'key')).toBeRejectedWithError(/not open/)
  })
})
