// this is an auto generated file. This will be overwritten

export const deleteUser = /* GraphQL */ `
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

export const signUpNewUser = /* GraphQL */ `
  mutation SignUpNewUser($newUser: NewUser!) {
    signUpNewUser(newUser: $newUser)
  }
`;
export const updateAvatarURL = /* GraphQL */ `
  mutation UpdateAvatarURL($path: String!) {
    updateAvatarURL(path: $path)
  }
`;
export const editUserInfo = /* GraphQL */ `
  mutation EditUserInfo($editUser: EditUser!) {
    editUserInfo(editUser: $editUser)
  }
`;
export const createNewPaziente = /* GraphQL */ `
  mutation CreateNewPaziente($newPaziente: NewPaziente!) {
    createNewPaziente(newPaziente: $newPaziente)
  }
`;
export const editPaziente = /* GraphQL */ `
  mutation EditPaziente($editPaziente: EditPaziente!) {
    editPaziente(editPaziente: $editPaziente)
  }
`;
export const markReportAsSeen = /* GraphQL */ `
  mutation MarkReportAsSeen($pazienteId: ID!, $reportId: ID!) {
    markReportAsSeen(pazienteId: $pazienteId, reportId: $reportId) {
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
        createdAt
        updatedAt
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
        createdAt
        updatedAt
        pazientiCount
        tasksCount
        reportsCount
        avatarURL
      }
    }
  }
`;
export const createNewReport = /* GraphQL */ `
  mutation CreateNewReport(
    $pazienteId: ID!
    $description: String!
    $contenuto: String!
    $tutorId: ID!
  ) {
    createNewReport(
      pazienteId: $pazienteId
      description: $description
      contenuto: $contenuto
      tutorId: $tutorId
    )
  }
`;
export const editReport = /* GraphQL */ `
  mutation EditReport(
    $reportId: ID!
    $description: String!
    $contenuto: String!
  ) {
    editReport(
      reportId: $reportId
      description: $description
      contenuto: $contenuto
    ) {
      reportId
      pazienteId
      description
      contenuto
      updatedAt
    }
  }
`;
