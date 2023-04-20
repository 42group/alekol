# Changelog

## [0.2.5] - 2023-04-20

### Features

- add account creation (the user can now be added to the database)
- login after first authentication if you already have an account
- add logout button on the new Dashboard page

## [0.2.4] - 2023-04-16

### Features

- add 42 authentication

### Fixes

- actually disable buttons (styles were just applied)

## [0.2.3] - 2023-04-11

### Features

- allow unlinking an account

### Security fixes

- use OAuth2 states (more details about this security issue: https://auth0.com/docs/secure/attack-protection/state-parameters)

## [0.2.2] - 2023-04-08

### Fixes

- fix bug from 0.2.1: now handles users without an avatar set

## [0.2.1] - 2023-04-07

### Features

- add a callback route (from Discord) that displays the user's profile

### Known bugs

- a 404 Not Found error is thrown when the user has a default avatar

## [0.2.0] - 2023-04-01

### Changes

- migrate backend to NestJS (migration is a big word: the project was still empty)

## [0.1.1] - 2023-03-30

### Features

- redirect to Discord website on button click

## [0.1.0] - 2023-03-28

### Features

- add an index page with two buttons to login
