import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('deployment bundle exposes the GHCR image and persistent Portainer service contract', () => {
  const compose = read('docker-compose.yml');
  assert.match(compose, /image:\s*ghcr\.io\/bjwlxyzhuzhu\/yzzw:latest/);
  assert.match(compose, /-\s*"8790:8787"/);
  assert.match(compose, /\/app\/data/);
  assert.match(compose, /YANZHI_MASTER_KEY/);
  assert.match(compose, /healthcheck:/);
});

test('GitHub Actions builds and publishes both supported Linux architectures', () => {
  const workflow = read('.github/workflows/docker-image.yml');
  assert.match(workflow, /linux\/amd64,linux\/arm64/);
  assert.match(workflow, /REGISTRY:\s*ghcr\.io/);
  assert.match(workflow, /IMAGE_NAME:\s*bjwlxyzhuzhu\/yzzw/);
  assert.match(workflow, /type=gha/);
});
