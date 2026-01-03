

## Installing Go

```
sudo apt update
sudo apt upgrade -y

wget https://dl.google.com/go/go1.25.5.linux-amd64.tar.gz

sudo tar -C /usr/local -xzf go1.25.5.linux-amd64.tar.gz
```

Remove the downloaded archive to save space (optional)

```
rm go1.25.5.linux-amd64.tar.gz
```

(Method 2: Using Ubuntu's Package Manager (Simpler but may not be latest))

```
sudo apt update
sudo apt install -y golang-go
```

Create Go workspace directories

```
mkdir -p ~/go/{bin,src,pkg}
```

Add these lines to your profile

```
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
```
