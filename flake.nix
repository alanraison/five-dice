{
    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
        flake-utils.url = "github:numtide/flake-utils";
    };
    outputs = { self, nixpkgs, flake-utils }:
        flake-utils.lib.eachDefaultSystem(system:
            let
                pkgs = import nixpkgs { inherit system; };
            in
            {
                devShell = with pkgs; mkShell {
                    packages = [awscli2 nodejs_24];
                };
            }
        );
}
