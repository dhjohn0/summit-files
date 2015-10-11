Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/precise32"
  config.vm.network :forwarded_port, guest: 1337, host: 1337
  config.vm.network :forwarded_port, guest: 5984, host: 5984
  config.vm.provision :shell, path: "vagrantBootstrap.sh"
  config.vm.provider "virtualbox" do |v|
    v.customize ["setextradata", :id,   "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
  end
end