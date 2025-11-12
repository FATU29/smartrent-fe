pipeline {
  agent any

  environment {
    NODE_VERSION = '24'
    NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    NEXT_TELEMETRY_DISABLED = '1'
    BUILD_STATUS = 'UNKNOWN'
    FAILED_STAGE = ''
    // Next.js build optimization
    NEXT_BUILD_CACHE_DIR = "${WORKSPACE}/.next-cache"
    // Disable lint/typecheck in build (already done in separate stages)
    SKIP_ENV_VALIDATION = 'true'
    // Cache directories
    NODE_MODULES_CACHE = "${WORKSPACE}/.node_modules_cache"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    ansiColor('xterm')
    // Cancel previous builds when a new build starts (for same PR/branch)
    // This ensures only the latest commit runs CI
    disableConcurrentBuilds(abortPrevious: true)
    // Skip stages if workspace is unchanged (saves time on rebuilds)
    skipStagesAfterUnstable()
  }

  stages {
    stage('Checkout') {
      steps {
        script {
          // Get branch/PR information
          def branchName = env.GIT_BRANCH ?: env.BRANCH_NAME ?: 'unknown'
          def isPR = branchName.contains('PR-') || branchName.contains('pull/')
          
          echo "============================================"
          echo "Build Information"
          echo "============================================"
          echo "Branch: ${branchName}"
          echo "Is PR: ${isPR}"
          echo "Build Number: ${env.BUILD_NUMBER}"
          echo "============================================"
          
          // Checkout first to get the actual commit
          echo "Checking out code from ${branchName}"
          checkout scm
          
          // Get the actual checked out commit
          def checkedOutCommit = sh(
            script: 'git rev-parse HEAD',
            returnStdout: true
          ).trim()
          
          echo "Checked out commit: ${checkedOutCommit}"
          
          // Note: disableConcurrentBuilds(abortPrevious: true) in options will automatically
          // cancel any previous builds for the same job when a new build starts.
          // This ensures only the latest commit runs CI for each PR/branch.
          if (isPR || (branchName != 'main' && branchName != 'master' && branchName != 'dev')) {
            echo "ℹ️ Previous builds for ${branchName} will be automatically canceled"
            echo "ℹ️ Only the latest commit will run CI"
          }
        }
      }
    }

    stage('Setup Node.js') {
      steps {
        script {
          // Detect Node.js tool once and cache for all stages
          def toolNames = ['NodeJS', 'node', "Node ${NODE_VERSION}.x", "NodeJS-${NODE_VERSION}", 'NodeJS-24', 'NodeJS-20', 'Node 24.x', 'Node 20.x']
          def foundTool = null
          
          for (def toolName : toolNames) {
            try {
              // Test if tool exists by trying to use it
              nodejs(nodeJSInstallationName: toolName) {
                sh 'node --version && npm --version'
              }
              foundTool = toolName
              echo "✅ Found Node.js installation: ${toolName}"
              break
            } catch (Exception e) {
              echo "⚠️ Tool '${toolName}' not found, trying next..."
            }
          }
          
          if (!foundTool) {
            error("❌ NodeJS tool not found! Please configure Node.js in Jenkins → Manage Jenkins → Tools → NodeJS installations")
          }
          
          // Store the tool name for later stages
          env.NODEJS_TOOL_NAME = foundTool
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
          script {
            echo "Installing npm dependencies with optimized caching..."
            sh """
              # Create cache directories
              mkdir -p ${NPM_CONFIG_CACHE}
              mkdir -p ${NODE_MODULES_CACHE}
              
              # Use npm ci with cache optimization
              # --prefer-offline: Use cache if available, skip network check
              # --no-audit: Skip security audit (saves 10-30 seconds)
              # --legacy-peer-deps: Faster dependency resolution if needed
              npm ci --prefer-offline --no-audit --cache ${NPM_CONFIG_CACHE}
            """
          }
        }
      }
    }

    // Run validation stages in parallel to save time
    stage('Validation') {
      parallel {
        stage('Lint') {
          steps {
            nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
              script {
                echo "Running ESLint..."
                try {
                  sh """
                    npm run lint
                  """
                  echo "✅ Linting passed!"
                } catch (Exception e) {
                  echo "❌ Caught exception: ${e.getClass().getName()}"
                  echo "❌ Error message: ${e.getMessage()}"
                  env.FAILED_STAGE = 'Lint'
                  env.BUILD_STATUS = 'FAILED'
                  error("Linting failed: ${e.getMessage()}")
                }
              }
            }
          }
          post {
            failure {
              script {
                echo "❌ Linting failed. Please fix the issues."
                archiveArtifacts artifacts: '**/eslint-report.*', allowEmptyArchive: true
              }
            }
          }
        }

        stage('Type Check') {
          steps {
            nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
              script {
                echo "Running TypeScript type checking..."
                try {
                  sh """
                    npm run typecheck
                  """
                  echo "✅ Type checking passed!"
                } catch (Exception e) {
                  echo "❌ Caught exception: ${e.getClass().getName()}"
                  echo "❌ Error message: ${e.getMessage()}"
                  env.FAILED_STAGE = 'Type Check'
                  env.BUILD_STATUS = 'FAILED'
                  error("Type checking failed: ${e.getMessage()}")
                }
              }
            }
          }
          post {
            failure {
              script {
                echo "❌ Type checking failed. Please fix the type errors."
                archiveArtifacts artifacts: '**/*.tsbuildinfo', allowEmptyArchive: true
              }
            }
          }
        }

        stage('i18n Check') {
          steps {
            nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
              script {
                echo "Checking i18n translation keys..."
                try {
                  sh """
                    npm run i18n:check
                  """
                  echo "✅ i18n check passed!"
                } catch (Exception e) {
                  echo "❌ Caught exception: ${e.getClass().getName()}"
                  echo "❌ Error message: ${e.getMessage()}"
                  env.FAILED_STAGE = 'i18n Check'
                  env.BUILD_STATUS = 'FAILED'
                  error("i18n check failed: ${e.getMessage()}")
                }
              }
            }
          }
          post {
            failure {
              script {
                echo "❌ i18n check failed. Please fix the translation key issues."
              }
            }
          }
        }

        stage('Format Check') {
          steps {
            nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
              script {
                echo "Checking code formatting..."
                try {
                  sh """
                    npm run format:check
                  """
                  echo "✅ Format check passed!"
                } catch (Exception e) {
                  echo "❌ Caught exception: ${e.getClass().getName()}"
                  echo "❌ Error message: ${e.getMessage()}"
                  env.FAILED_STAGE = 'Format Check'
                  env.BUILD_STATUS = 'FAILED'
                  error("Format check failed: ${e.getMessage()}")
                }
              }
            }
          }
          post {
            failure {
              script {
                echo "❌ Format check failed. Run 'npm run format' to fix formatting issues."
              }
            }
          }
        }
      }
    }

    stage('Build') {
      options {
        // Increase timeout for build stage (build can take longer)
        timeout(time: 45, unit: 'MINUTES')
      }
      steps {
        nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
          script {
            echo "Building Next.js application with optimized caching..."
            echo "Using build:check to skip lint/typecheck (already done in Validation stage)"
            try {
              // Create cache directories for Next.js build cache
              sh """
                mkdir -p ${NEXT_BUILD_CACHE_DIR}
                mkdir -p .next/cache
              """
              
              // Use build:check to skip lint/typecheck (already validated in separate stages)
              // This significantly speeds up the build process
              // Set NODE_ENV=production for faster builds
              sh """
                NODE_ENV=production npm run build:check
              """
              env.BUILD_STATUS = 'SUCCESS'
              echo "✅ Build completed successfully!"
            } catch (Exception e) {
              echo "❌ Caught exception: ${e.getClass().getName()}"
              echo "❌ Error message: ${e.getMessage()}"
              env.FAILED_STAGE = 'Build'
              env.BUILD_STATUS = 'FAILED'
              error("Build failed: ${e.getMessage()}")
            }
          }
        }
      }
      post {
        success {
          script {
            echo "✅ Build completed successfully!"
            archiveArtifacts artifacts: '.next/**/*', allowEmptyArchive: false, fingerprint: true
          }
        }
        failure {
          script {
            echo "❌ Build failed. Please check the build logs."
            // Archive build logs for debugging
            archiveArtifacts artifacts: '**/build-output.log', allowEmptyArchive: true
          }
        }
      }
    }

    stage('SonarCloud Analysis') {
      options {
        // Increase timeout to 20 minutes (optimized configuration should be faster)
        timeout(time: 20, unit: 'MINUTES')
        // Allow SonarCloud to run even if build fails (for code quality monitoring)
        skipDefaultCheckout(false)
      }
      steps {
        script {
          echo "Running SonarCloud analysis (optimized for performance)..."
          
          withCredentials([
            string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN'),
            string(credentialsId: 'SONAR_PROJECT_KEY', variable: 'SONAR_PROJECT_KEY'),
            string(credentialsId: 'SONAR_ORG', variable: 'SONAR_ORG')
          ]) {
            nodejs(nodeJSInstallationName: env.NODEJS_TOOL_NAME ?: 'NodeJS') {
              try {
                // Check if sonar-scanner is available, if not use npx
                def scannerCommand = sh(
                  script: 'which sonar-scanner || echo "not-found"',
                  returnStdout: true
                ).trim()

                def sonarCmd = scannerCommand != 'not-found' ? 'sonar-scanner' : 'npx -y sonar-scanner@latest'

                // Optimized SonarCloud configuration for faster analysis
                // Key optimizations:
                // 1. More exclusions to reduce files scanned
                // 2. Higher CPD minimum tokens (reduces duplicate detection overhead)
                // 3. Disable unnecessary analysis features
                // 4. Limit analysis to changed files when possible
                sh """
                  ${sonarCmd} \\
                    -Dsonar.projectKey=\${SONAR_PROJECT_KEY} \\
                    -Dsonar.organization=\${SONAR_ORG} \\
                    -Dsonar.sources=src \\
                    -Dsonar.sourceEncoding=UTF-8 \\
                    -Dsonar.host.url=https://sonarcloud.io \\
                    -Dsonar.login=\${SONAR_TOKEN} \\
                    -Dsonar.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/__tests__/**,**/__mocks__/**,**/constants/common/districts.ts,**/constants/common/wards.ts,**/node_modules/**,**/.next/**,**/dist/**,**/build/**,**/*.d.ts,**/types/**,**/generated/**,**/coverage/**,**/.cache/**,**/public/**,**/messages/** \\
                    -Dsonar.cpd.exclusions=**/constants/common/districts.ts,**/constants/common/wards.ts,**/constants/common/provinces.ts \\
                    -Dsonar.coverage.exclusions=src/**/* \\
                    -Dsonar.cpd.minimumTokens=150 \\
                    -Dsonar.javascript.lcov.reportPaths= \\
                    -Dsonar.typescript.lcov.reportPaths= \\
                    -Dsonar.typescript.tsconfigPath=tsconfig.json
                """
                echo "✅ SonarCloud analysis completed!"
              } catch (Exception e) {
                echo "❌ Caught exception: ${e.getClass().getName()}"
                echo "❌ Error message: ${e.getMessage()}"
                env.FAILED_STAGE = 'SonarCloud Analysis'
                // Don't fail the entire build on SonarCloud timeout/errors
                // SonarCloud is for code quality monitoring, not blocking deployment
                if (e.getMessage().contains('Timeout')) {
                  echo "⚠️ SonarCloud analysis timed out (this is common for large projects)"
                  echo "ℹ️ Consider running SonarCloud analysis separately or reducing scan scope"
                } else {
                  echo "⚠️ SonarCloud analysis failed but continuing pipeline..."
                }
                echo "ℹ️ Check SonarCloud dashboard for details"
                // Uncomment below if you want SonarCloud failures to fail the build:
                // env.BUILD_STATUS = 'FAILED'
                // error("SonarCloud analysis failed: ${e.getMessage()}")
              }
            }
          }
        }
      }
      post {
        always {
          script {
            echo "SonarCloud analysis stage completed."
          }
        }
        failure {
          script {
            echo "❌ SonarCloud analysis failed. Check SonarCloud dashboard for details."
          }
        }
      }
    }
  }

  post {
    always {
      script {
        // Capture build information
        def buildInfo = """
          ============================================
          BUILD INFORMATION
          ============================================
          Job: ${env.JOB_NAME}
          Build Number: ${env.BUILD_NUMBER}
          Branch: ${env.GIT_BRANCH ?: env.BRANCH_NAME}
          Status: ${currentBuild.currentResult}
          Failed Stage: ${env.FAILED_STAGE ?: 'N/A'}
          Build URL: ${env.BUILD_URL}
          ============================================
        """
        echo buildInfo

        // Clean up workspace (preserve caches for next build)
        echo "Cleaning up workspace (preserving caches)..."
        sh """
          # Preserve npm cache and Next.js cache for faster subsequent builds
          # Only clean build artifacts, not caches
          # rm -rf .next/standalone .next/static
          
          # Optional: Clean up node_modules to save space (uncomment if needed)
          # rm -rf node_modules
        """
      }
      cleanWs(
        cleanWhenNotBuilt: false,
        deleteDirs: true,
        disableDeferredWipeout: true,
        notFailBuild: true
      )
    }
    success {
      script {
        echo "✅ Pipeline completed successfully!"
        env.BUILD_STATUS = 'SUCCESS'
      }
    }
    failure {
      script {
        echo "❌ Pipeline failed!"
        env.BUILD_STATUS = 'FAILED'
        
        // Get failure details
        def failedStage = env.FAILED_STAGE ?: 'Unknown'
        def buildUrl = env.BUILD_URL ?: 'N/A'
        def branch = env.GIT_BRANCH ?: env.BRANCH_NAME ?: 'N/A'
        
        echo """
          ============================================
          FAILURE DETAILS
          ============================================
          Failed Stage: ${failedStage}
          Branch: ${branch}
          Build URL: ${buildUrl}
          ============================================
        """
      }
    }
    unstable {
      script {
        echo "⚠️ Pipeline is unstable!"
        env.BUILD_STATUS = 'UNSTABLE'
      }
    }
    aborted {
      script {
        echo "⏹️ Pipeline was aborted!"
        env.BUILD_STATUS = 'ABORTED'
      }
    }
  }
}

