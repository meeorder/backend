Feature: Menu Test
  Scenario: Create Menu, Publish, Get Menu and Delete Menu
    Given a menu
    When create a menu
    And publish this menu
    Then should return status code 200
    And should return a same menu id when get by the same id
    And "published_date" field should not be null in response
    When delete this menu
    And get this menu by the same id
    Then "deleted_date" field should not be null in response



