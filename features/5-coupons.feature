@coupon
Feature: Coupons
  Scenario: Create a coupon
    When create a coupon
      | title    | price | required_points |
      | MyCoupon | 100   | 100             |
    Then should return status code 201
    Then should coupon appear in database

  Scenario: Get coupon by id
    Given coupons
      | _id                      | title   | price | required_point |
      | 64c5485a510698e8c9e7bdc0 | Coupon1 | 22    | 100            |
      | 64f34297ad045cb1f407c478 | Coupon2 | 11    | 200            |
    When get coupon by id "64c5485a510698e8c9e7bdc0"
    Then should return status code 200
    Then should response data be
      | key   | value                    | type   |
      | _id   | 64c5485a510698e8c9e7bdc0 | string |
      | title | Coupon1                  | string |

  Scenario: Get all coupons by owner
    Given coupons
      | _id                      | title   | price | required_point |
      | 64f09e7476b02c5ea04be8ea | Coupon1 | 100   | 100            |
      | 64f09e7476b02c5ea04be8eb | Coupon2 | 200   | 200            |
    When get all coupons by owner
    Then should return status code 200
    Then should response be length 2

  Scenario: Get all coupons by session
    Given coupons
      | _id                      | title   | price | required_point |
      | 64f09e7476b02c5ea04be8ea | Coupon1 | 100   | 100            |
      | 64f09e7476b02c5ea04be8eb | Coupon2 | 200   | 200            |
    Given sessions
      | _id                      | finished_at | table                    | point |
      | 64c5485a510698e8c9e7bdc0 |             | 64f55c53561fa6a99fc45b29 | 150   |

    When get all coupons by session "64c5485a510698e8c9e7bdc0"
    Then should return status code 200
    And coupon response id "64f09e7476b02c5ea04be8ea" usable should be "true"
    And coupon response id "64f09e7476b02c5ea04be8eb" usable should be "false"
