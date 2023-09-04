@session
Feature: Session
  Background:
    Given tables
      | _id                      | table_number |
      | 64f55c53561fa6a99fc45b29 | 1            |
      | 64f55c65561fa6a99fc45b2a | 2            |

  Scenario: Create a session
    When create session
      | table                    | uid                                  |
      | 64f55c53561fa6a99fc45b29 | 4209c41a-e506-474a-9c50-8071300ca3c7 |
    Then should return status code 201
    Then should session appear in database

  Scenario: Get session by table
    Given sessions
      | _id                      | finished_at | table |
      | 64c5485a510698e8c9e7bdb5 | 2016-01-01  | 1     |
      | 64c5485a510698e8c9e7bdc0 |             | 1     |
    When get session by table 1
    Then should return status code 200
    Then should response data be
      | key         | value                    | type   |
      | _id         | 64c5485a510698e8c9e7bdc0 | string |
      | finished_at |                          | null   |

  Scenario: Finish session
    Given sessions
      | _id                      | finished_at | table |
      | 64c5485a510698e8c9e7bdb5 |             | 1     |
    When finish session "64c5485a510698e8c9e7bdb5"
    Then should return status code 204
    Then should session "64c5485a510698e8c9e7bdb5" update to finished

  Scenario: Get all sessions
    Given sessions
      | _id                      | finished_at | table |
      | 64c5485a510698e8c9e7bdb5 | 2016-01-01  | 1     |
      | 64c5485a510698e8c9e7bdc0 |             | 1     |
    When get all sessions
    Then should return status code 200
    Then should not finished session appear

  Scenario: Get session
    Given sessions
      | _id                      | finished_at | table |
      | 64c5485a510698e8c9e7bdc0 |             | 1     |
    When get session "64c5485a510698e8c9e7bdc0"
    Then should return status code 200
    Then should response data be
      | key         | value                    | type   |
      | _id         | 64c5485a510698e8c9e7bdc0 | string |
      | finished_at |                          | null   |
      | table       | 1                        | number |
