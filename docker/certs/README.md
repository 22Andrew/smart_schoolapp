# Local build certificates

This directory must exist for the Docker build. On ordinary networks, leave it empty except for this README and .gitignore.

If a corporate HTTPS proxy causes Maven PKIX certificate errors, export its approved public root CA from the Windows Trusted Root Certification Authorities store as a PEM-encoded `.crt` file into this directory. Only use a certificate whose issuer and fingerprint are verified against your organization's existing trusted configuration. Never add private keys.

The Dockerfile imports these certificates into Java's trust store in the build stage only. They are not copied into the final application image. Local `.crt` files are ignored by Git, but included in the local Docker build context.

Then run from the project root:

```powershell
docker build -t springboot-app .
```

If a separate docker-container builder fails before Maven with an x509 registry error, use Docker Desktop's built-in builder:

```powershell
docker --context=default build -t springboot-app .
```

Do not disable TLS verification or configure an insecure registry.
