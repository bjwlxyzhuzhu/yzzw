# Portainer Web editor 部署

## 1. 首次准备

GitHub Actions 会在 `main` 分支 push 后构建并发布：

`ghcr.io/bjwlxyzhuzhu/yzzw:latest`

如果 GHCR 包不是公开的，请在 Portainer 的 Registry 中添加 GitHub Container Registry 凭据，用户名填写 GitHub 用户名，密码使用具有 `read:packages` 权限的 token。

先生成并保存一个稳定的主密钥（后续升级不能更换，否则已保存的模型 API Key 无法解密）：

```bash
openssl rand -hex 32
```

## 2. Web editor

在 Portainer → Stacks → Add stack → Web editor 中粘贴 `docker-compose.yml` 的内容，并在 Environment variables 中设置：

```text
YANZHI_MASTER_KEY=上一步生成的64位十六进制字符串
YANZHI_SECURE_COOKIE=0
```

点击 Deploy the stack 后访问：

`http://服务器IP:8790/`

数据会直接持久化在宿主机 `/opt/yzzw` 目录中。部署前请在宿主机执行：

```bash
sudo mkdir -p /opt/yzzw
```

如果容器以非 root 用户写入数据而遇到权限错误，请将目录所有者调整为容器用户（当前镜像使用 Node 用户）：

```bash
sudo chown -R 1000:1000 /opt/yzzw
```

## 3. 创建管理员

进入 Portainer 的容器 Console，执行：

```bash
node server/cli.js create-admin --login admin
```

按提示设置至少 8 位、同时含字母和数字的密码，然后访问 `/admin/login`。也可以先在 Console 中设置 `YANZHI_ADMIN_PASSWORD` 后使用非交互方式创建管理员：

```bash
YANZHI_ADMIN_PASSWORD='请替换为强密码' node server/cli.js create-admin --login admin
```

不要把真实密码、主密钥或 API Key 提交到 Git 仓库。
