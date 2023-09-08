@categories
Feature: Categories

  Scenario: Get All Cateogires
    Given categories
      | _id                      | title |
      | 64f5f6ac50c26b28d962965e | Cat5  |
      | 64f5f6b25c81011f9748ba46 | Cat6  |
      | 64f5f7863588f08483c7ee4d | Cat7  |
    When get all categories
    Then should return status code 200
    Then response size should equal to 3

  Scenario: Create a category
    When create a category
      | title |
      | Cat1  |
    Then should return status code 201
    Then should category appear in database

  Scenario: Get Category by Id
    Given categories
      | _id                      | title |
      | 64f4a310e4984065865a2580 | Cat2  |
      | 64f4a310e4984065865a257e | Cat3  |
    When get category by id "64f4a310e4984065865a257e"
    Then should return status code 200
    Then should response data be
      | key   | value                    | type   |
      | _id   | 64f4a310e4984065865a257e | string |
      | title | Cat3                     | string |
      | rank  |                          | null   |

  Scenario: Update category
    Given categories
      | _id                      | title |
      | 64f5ec463ec7999abb9b6f0f | Cat4  |
    When update category at id "64f5ec463ec7999abb9b6f0f"
      | title    |
      | New_Cat4 |
    Then should return status code 200
    When get category by id "64f5ec463ec7999abb9b6f0f"
    Then should response data be
      | key   | value                    | type   |
      | _id   | 64f5ec463ec7999abb9b6f0f | string |
      | title | New_Cat4                 | string |

  Scenario: Update category rank
    Given categories
      | _id                      | title |
      | 64f6d1b448c75d8f1f2982e0 | Cat4  |
      | 64f6d1c98e9e6db0ff03a2f0 | Cat5  |
    When update cateogries rank
      | rank                                              |
      | 64f6d1c98e9e6db0ff03a2f0,64f6d1b448c75d8f1f2982e0 |
    Then should return status code 204
    When get category by id "64f6d1b448c75d8f1f2982e0"
    Then should response data be
      | key  | value                    | type   |
      | _id  | 64f6d1b448c75d8f1f2982e0 | string |
      | rank | 1                        | number |
    When get category by id "64f6d1c98e9e6db0ff03a2f0"
    Then should response data be
      | key  | value                    | type   |
      | _id  | 64f6d1c98e9e6db0ff03a2f0 | string |
      | rank | 0                        | number |


