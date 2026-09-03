# Smart School tests

Run the full suite:

```bash
./mvnw test
```

## Layout

| Package | Tests | Focus |
|---------|-------|--------|
| `auth` | `AuthIntegrationTest`, `UserLoginAuthServiceTest` | Login pages, demo accounts, auth service |
| `fee` | `StudentFeeIntegrationTest`, `StudentFeeServiceTest` | Collect fees pages/API, fee validation |
| `student` | `StudentIntegrationTest`, `StudentAdmissionServiceTest`, `StudentCategoryServiceTest` | Student search/profile/API, admission rules |
| `forgotpassword` | `ForgotPasswordIntegrationTest`, `ForgotPasswordServiceTest` | Reset flow pages, token validation |

## Requirements

- **Integration tests** use the `test` profile and your local MySQL database (same settings as `application.properties`, with SQL bootstrap disabled).
- **Unit tests** use Mockito and do not need a database.

Demo credentials used in tests are defined in `support/TestAccounts.java`.
