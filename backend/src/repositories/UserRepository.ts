export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User>
  update(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null>
  delete(id: string): Promise<boolean>
}

// In-memory data store
let users: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    createdAt: new Date('2024-01-02')
  }
]

export function createUserRepository(): UserRepository {
  return {
    async findAll(): Promise<User[]> {
      return Promise.resolve([...users])
    },

    async findById(id: string): Promise<User | null> {
      const user = users.find(u => u.id === id)
      return Promise.resolve(user || null)
    },

    async findByEmail(email: string): Promise<User | null> {
      const user = users.find(u => u.email === email)
      return Promise.resolve(user || null)
    },

    async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
      const newUser: User = {
        id: (users.length + 1).toString(),
        ...userData,
        createdAt: new Date()
      }
      
      users.push(newUser)
      return Promise.resolve(newUser)
    },

    async update(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
      const userIndex = users.findIndex(u => u.id === id)
      
      if (userIndex === -1) {
        return Promise.resolve(null)
      }

      users[userIndex] = {
        ...users[userIndex],
        ...userData
      }

      return Promise.resolve(users[userIndex])
    },

    async delete(id: string): Promise<boolean> {
      const userIndex = users.findIndex(u => u.id === id)
      
      if (userIndex === -1) {
        return Promise.resolve(false)
      }

      users.splice(userIndex, 1)
      return Promise.resolve(true)
    }
  }
}
