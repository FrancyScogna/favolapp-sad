// this is an auto generated file. This will be overwritten

export const getMyUser = /* GraphQL */ `
  query GetMyUser {
    getMyUser {
      id
      email
      name
      surname
      role
      birthdate
      phone_number
      gender
      codfis
      provincia
      comune
      title
      createdAt
      updatedAt
      pazientiCount
      tasksCount
      reportsCount
      avatarURL
    }
  }
`;
export const getUsersList = /* GraphQL */ `
  query GetUsersList($limit: Int, $nextToken: String) {
    getUsersList(limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        name
        surname
        role
        birthdate
        phone_number
        gender
        codfis
        provincia
        comune
        title
        createdAt
        updatedAt
        pazientiCount
        tasksCount
        reportsCount
        avatarURL
        active
      }
      nextToken
    }
  }
`;
export const searchAllUsers = /* GraphQL */ `
  query SearchAllUsers($query: String!, $limit: Int, $nextToken: String) {
    searchAllUsers(query: $query, limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        name
        surname
        role
        birthdate
        phone_number
        gender
        codfis
        provincia
        comune
        title
        createdAt
        updatedAt
        pazientiCount
        tasksCount
        reportsCount
        avatarURL
      }
      nextToken
    }
  }
`;
export const getPazientiList = /* GraphQL */ `
  query GetPazientiList($limit: Int, $nextToken: String) {
    getPazientiList(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        surname
        birthdate
        phone_number
        gender
        email
        codfis
        provincia
        comune
        createdAt
        updatedAt
        info
        treatment
        sessionsCount
        tutorsCount
      }
      nextToken
    }
  }
`;
export const searchAllPazienti = /* GraphQL */ `
  query SearchAllPazienti($query: String!, $limit: Int, $nextToken: String) {
    searchAllPazienti(query: $query, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        surname
        birthdate
        phone_number
        gender
        email
        codfis
        provincia
        comune
        createdAt
        updatedAt
        info
        treatment
        sessionsCount
        tutorsCount
      }
      nextToken
    }
  }
`;
export const getMyPazienti = /* GraphQL */ `
  query GetMyPazienti($limit: Int, $nextToken: String) {
    getMyPazienti(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        surname
        birthdate
        phone_number
        gender
        email
        codfis
        provincia
        comune
        createdAt
        updatedAt
        info
        treatment
        sessionsCount
        tutorsCount
      }
      nextToken
    }
  }
`;
export const searchMyPazienti = /* GraphQL */ `
  query SearchMyPazienti($query: String!, $limit: Int, $nextToken: String) {
    searchMyPazienti(query: $query, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        surname
        birthdate
        phone_number
        gender
        email
        codfis
        provincia
        comune
        createdAt
        updatedAt
        info
        treatment
        sessionsCount
        tutorsCount
      }
      nextToken
    }
  }
`;
export const getCommonPazienti = /* GraphQL */ `
  query GetCommonPazienti($userId: ID!, $limit: Int, $nextToken: String) {
    getCommonPazienti(userId: $userId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        surname
        birthdate
        phone_number
        gender
        email
        codfis
        provincia
        comune
        createdAt
        updatedAt
        info
        treatment
        sessionsCount
        tutorsCount
      }
      nextToken
    }
  }
`;
export const searchCommonPazienti = /* GraphQL */ `
  query SearchCommonPazienti(
    $userId: ID!
    $query: String!
    $limit: Int
    $nextToken: String
  ) {
    searchCommonPazienti(
      userId: $userId
      query: $query
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        surname
        birthdate
        phone_number
        gender
        email
        codfis
        provincia
        comune
        createdAt
        updatedAt
        info
        treatment
        sessionsCount
        tutorsCount
      }
      nextToken
    }
  }
`;
export const getPazientiByUserId = /* GraphQL */ `
  query GetPazientiByUserId($userId: ID!, $limit: Int, $nextToken: String) {
    getPazientiByUserId(userId: $userId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        surname
        birthdate
        phone_number
        gender
        email
        codfis
        provincia
        comune
        createdAt
        updatedAt
        info
        treatment
        sessionsCount
        tutorsCount
      }
      nextToken
    }
  }
`;
export const searchPazientiByUserId = /* GraphQL */ `
  query SearchPazientiByUserId(
    $userId: ID!
    $query: String!
    $limit: Int
    $nextToken: String
  ) {
    searchPazientiByUserId(
      userId: $userId
      query: $query
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        surname
        birthdate
        phone_number
        gender
        email
        codfis
        provincia
        comune
        createdAt
        updatedAt
        info
        treatment
        sessionsCount
        tutorsCount
      }
      nextToken
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($userId: ID!) {
    getUser(userId: $userId) {
      id
      email
      name
      surname
      role
      birthdate
      phone_number
      gender
      codfis
      provincia
      comune
      title
      createdAt
      updatedAt
      pazientiCount
      tasksCount
      reportsCount
      avatarURL
      active
    }
  }
`;
export const getPaziente = /* GraphQL */ `
  query GetPaziente($pazienteId: ID!) {
    getPaziente(pazienteId: $pazienteId) {
      id
      name
      surname
      birthdate
      phone_number
      gender
      email
      codfis
      provincia
      comune
      createdAt
      updatedAt
      info
      treatment
      sessions {
        id
        pazienteId
        weekDay
        startTime
        endTime
        createdAt
        updatedAt
      }
      sessionsCount
      tutors {
        id
        email
        name
        surname
        role
        birthdate
        phone_number
        gender
        codfis
        provincia
        comune
        title
        createdAt
        updatedAt
        pazientiCount
        tasksCount
        reportsCount
        avatarURL
      }
      tutorsCount
    }
  }
`;
export const getAllReports = /* GraphQL */ `
  query GetAllReports($limit: Int, $nextToken: String) {
    getAllReports(limit: $limit, nextToken: $nextToken) {
      items {
        reportId
        pazienteId
        tutorId
        description
        seenBy
        contenuto
        createdAt
        updatedAt
        paziente {
          id
          name
          surname
          birthdate
          phone_number
          gender
          email
          codfis
          provincia
          comune
          info
          treatment
          sessionsCount
          tutorsCount
        }
        tutor {
          id
          email
          name
          surname
          role
          birthdate
          phone_number
          gender
          codfis
          provincia
          comune
          title
          pazientiCount
          tasksCount
          reportsCount
          avatarURL
        }
      }
      nextToken
    }
  }
`;
export const getMyReport = /* GraphQL */ `
  query GetMyReport($limit: Int, $nextToken: String) {
    getMyReport(limit: $limit, nextToken: $nextToken) {
      items {
        reportId
        pazienteId
        tutorId
        description
        seenBy
        contenuto
        createdAt
        updatedAt
        paziente {
          id
          name
          surname
          birthdate
          phone_number
          gender
          email
          codfis
          provincia
          comune
          info
          treatment
          sessionsCount
          tutorsCount
        }
        tutor {
          id
          email
          name
          surname
          role
          birthdate
          phone_number
          gender
          codfis
          provincia
          comune
          title
          pazientiCount
          tasksCount
          reportsCount
          avatarURL
        }
      }
      nextToken
    }
  }
`;
export const getColleguesReports = /* GraphQL */ `
  query GetColleguesReports($limit: Int, $nextToken: String) {
    getColleguesReports(limit: $limit, nextToken: $nextToken) {
      items {
        reportId
        pazienteId
        tutorId
        description
        seenBy
        contenuto
        createdAt
        updatedAt
        paziente {
          id
          name
          surname
          birthdate
          phone_number
          gender
          email
          codfis
          provincia
          comune
          info
          treatment
          sessionsCount
          tutorsCount
        }
        tutor {
          id
          email
          name
          surname
          role
          birthdate
          phone_number
          gender
          codfis
          provincia
          comune
          title
          pazientiCount
          tasksCount
          reportsCount
          avatarURL
        }
      }
      nextToken
    }
  }
`;
export const getMyCollegues = /* GraphQL */ `
  query GetMyCollegues($limit: Int, $nextToken: String) {
    getMyCollegues(limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        name
        surname
        role
        birthdate
        phone_number
        gender
        codfis
        provincia
        comune
        title
        createdAt
        updatedAt
        pazientiCount
        tasksCount
        reportsCount
        avatarURL
      }
      nextToken
    }
  }
`;
export const searchMyCollegues = /* GraphQL */ `
  query SearchMyCollegues($query: String!, $limit: Int, $nextToken: String) {
    searchMyCollegues(query: $query, limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        name
        surname
        role
        birthdate
        phone_number
        gender
        codfis
        provincia
        comune
        title
        createdAt
        updatedAt
        pazientiCount
        tasksCount
        reportsCount
        avatarURL
      }
      nextToken
    }
  }
`;
export const getLogs = /* GraphQL */ `
  query GetLogs(
    $tab: String!
    $filter: FilterLogsInput
    $limit: Int
    $nextToken: String
  ) {
    getLogs(tab: $tab, filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        timestamp
        operationName
        operationType
        operationMessage
        operationResult
        error
        errorMessage
        errorType
        author {
          id
          email
          name
          surname
          role
          birthdate
          phone_number
          gender
          codfis
          provincia
          comune
          title
          pazientiCount
          tasksCount
          reportsCount
          avatarURL
        }
      }
      nextToken
    }
  }
`;
export const getReportsByOtherUser = /* GraphQL */ `
  query GetReportsByOtherUser(
    $otherUserId: ID!
    $limit: Int
    $nextToken: String
  ) {
    getReportsByOtherUser(
      otherUserId: $otherUserId
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        reportId
        pazienteId
        tutorId
        description
        seenBy
        contenuto
        createdAt
        updatedAt
        paziente {
          id
          name
          surname
          birthdate
          phone_number
          gender
          email
          codfis
          provincia
          comune
          info
          treatment
          sessionsCount
          tutorsCount
        }
        tutor {
          id
          email
          name
          surname
          role
          birthdate
          phone_number
          gender
          codfis
          provincia
          comune
          title
          pazientiCount
          tasksCount
          reportsCount
          avatarURL
        }
      }
      nextToken
    }
  }
`;
