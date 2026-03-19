import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { environment } from '../../environments/environment'
import { UserService } from './user.service'
import type { User, UserListResponse } from '../models/user.interface'

describe('UserService (11.9)', () => {
  let service: UserService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  const mockResponse: UserListResponse<User> = {
    users: [
      { id: 1, name: 'Alice', email: 'alice@test.local', createdAt: '', updatedAt: '' }
    ],
    totalItems: 1,
    currentPage: 1,
    limit: 50,
    totalPages: 1
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    })
    service = TestBed.inject(UserService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call GET /users with default page/limit for list()', () => {
    service.list().subscribe((res) => expect(res.users[0].id).toBe(1))

    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/users` && r.method === 'GET')
    expect(req.request.params.get('page')).toBe('1')
    expect(req.request.params.get('limit')).toBe('50')
    req.flush(mockResponse)
  })

  it('should call GET /users with page/limit for list(page, limit)', () => {
    service.list(2, 10).subscribe((res) => expect(res.totalItems).toBe(1))

    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/users` && r.method === 'GET')
    expect(req.request.params.get('page')).toBe('2')
    expect(req.request.params.get('limit')).toBe('10')
    req.flush({ ...mockResponse, currentPage: 2, limit: 10, totalPages: 1 })
  })
})

