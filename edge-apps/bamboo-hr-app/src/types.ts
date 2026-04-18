export interface Employee {
  eeid: number
  firstName: string
  lastName: string
  dateOfBirth: string
  hireDate: string
  employeePhoto: string
}

export interface Leave {
  id: number
  employeeId: number
  name: string
  start: string
  end: string
  type: string
}
