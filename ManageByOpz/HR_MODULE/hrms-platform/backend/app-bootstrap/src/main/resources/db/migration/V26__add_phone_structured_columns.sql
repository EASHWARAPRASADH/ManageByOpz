-- V26: Add structured phone columns to employee_twins
ALTER TABLE employee_twins
  ADD COLUMN work_phone_country_code   VARCHAR(5)  NULL,
  ADD COLUMN work_phone_number         VARCHAR(20) NULL,
  ADD COLUMN work_phone_full           VARCHAR(20) NULL,
  ADD COLUMN personal_phone_country_code VARCHAR(5)  NULL,
  ADD COLUMN personal_phone_number       VARCHAR(20) NULL,
  ADD COLUMN personal_phone_full         VARCHAR(20) NULL;
